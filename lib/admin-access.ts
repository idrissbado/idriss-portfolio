import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { getNicknameValidationError, normalizeNickname } from "@/lib/nickname";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  nickname: string;
  role: string;
  passwordHash: string;
  emailVerified?: Date | null;
  verificationTokenHash?: string | null;
  verificationExpiresAt?: Date | null;
};

const fallbackUsers = new Map<string, AdminUser>();

export class AccountConflictError extends Error {
  constructor(public readonly field: "email" | "nickname") {
    super(field === "nickname" ? "This nickname is already taken." : "An account with this email already exists.");
    this.name = "AccountConflictError";
  }
}

function getUniqueConstraintField(error: unknown) {
  if (!error || typeof error !== "object" || !("code" in error) || error.code !== "P2002") {
    return null;
  }

  const target = "meta" in error && error.meta && typeof error.meta === "object" && "target" in error.meta
    ? String(error.meta.target)
    : "";

  return target.toLowerCase().includes("nickname") ? "nickname" : "email";
}

function getFallbackAdminConfig() {
  const email = (process.env.ADMIN_EMAIL || "drissbadoolivier@gmail.com").trim().toLowerCase();
  const name = process.env.ADMIN_NAME || "Driss Olivier Bado";
  const nickname = normalizeNickname(process.env.ADMIN_NICKNAME || "idriss-bado");
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(password, 10);

  return { email, name, nickname, passwordHash };
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const fallbackConfig = getFallbackAdminConfig();

  if (normalizedEmail === fallbackConfig.email) {
    return {
      id: "fallback-admin",
      email: fallbackConfig.email,
      name: fallbackConfig.name,
      nickname: fallbackConfig.nickname,
      role: "admin",
      passwordHash: fallbackConfig.passwordHash,
      emailVerified: new Date(),
      verificationTokenHash: null,
      verificationExpiresAt: null,
    } satisfies AdminUser;
  }

  if (fallbackUsers.has(normalizedEmail)) {
    return fallbackUsers.get(normalizedEmail)!;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (user) {
      return user as AdminUser;
    }
  } catch {
    // Fall back to the in-memory store when the database is not available.
  }

  return null;
}

export async function findUserByNickname(value: string) {
  const nickname = normalizeNickname(value);
  const fallbackConfig = getFallbackAdminConfig();

  if (nickname === fallbackConfig.nickname) {
    return {
      id: "fallback-admin",
      email: fallbackConfig.email,
      name: fallbackConfig.name,
      nickname: fallbackConfig.nickname,
      role: "admin",
      passwordHash: fallbackConfig.passwordHash,
      emailVerified: new Date(),
      verificationTokenHash: null,
      verificationExpiresAt: null,
    } satisfies AdminUser;
  }

  const fallbackUser = Array.from(fallbackUsers.values()).find((user) => user.nickname === nickname);
  if (fallbackUser) {
    return fallbackUser;
  }

  try {
    const user = await prisma.user.findUnique({ where: { nickname } });
    return user ? user as AdminUser : null;
  } catch {
    return null;
  }
}

export async function createUserAccount(input: {
  email: string;
  name?: string;
  nickname: string;
  password: string;
  role?: string;
  emailVerified?: Date | null;
  verificationTokenHash?: string | null;
  verificationExpiresAt?: Date | null;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
  const nickname = normalizeNickname(input.nickname);
  const nicknameError = getNicknameValidationError(nickname);

  if (nicknameError) {
    throw new Error(nicknameError);
  }

  const role = input.role ?? "member";
  const passwordHash = await bcrypt.hash(input.password, 10);
  const emailVerified = input.emailVerified ?? (role === "admin" ? new Date() : null);
  const verificationTokenHash = input.verificationTokenHash ?? null;
  const verificationExpiresAt = input.verificationExpiresAt ?? null;

  const fallbackConfig = getFallbackAdminConfig();
  if (normalizedEmail === fallbackConfig.email) {
    const fallbackUser: AdminUser = {
      id: "fallback-admin",
      email: normalizedEmail,
      name: input.name || fallbackConfig.name,
      nickname,
      role,
      passwordHash: fallbackConfig.passwordHash,
      emailVerified: emailVerified ?? new Date(),
      verificationTokenHash,
      verificationExpiresAt,
    };
    fallbackUsers.set(normalizedEmail, fallbackUser);
    return fallbackUser;
  }

  if (Array.from(fallbackUsers.values()).some((user) => user.nickname === nickname)) {
    throw new AccountConflictError("nickname");
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: input.name?.trim() || null,
        nickname,
        passwordHash,
        role,
        emailVerified,
        verificationTokenHash,
        verificationExpiresAt,
      },
    });

    return user as AdminUser;
  } catch (error) {
    const conflictField = getUniqueConstraintField(error);
    if (conflictField) {
      throw new AccountConflictError(conflictField);
    }

    console.error("Database error while creating user account:", error);
    throw new Error("The database is unavailable right now. Please try again in a moment.");
  }
}

export async function listUsers() {
  const fallbackConfig = getFallbackAdminConfig();
  const fallbackUserList = [
    {
      id: "fallback-admin",
      email: fallbackConfig.email,
      name: fallbackConfig.name,
      nickname: fallbackConfig.nickname,
      role: "admin",
      createdAt: new Date(),
    },
    ...Array.from(fallbackUsers.values()).map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      role: user.role,
      createdAt: new Date(),
    })),
  ];

  try {
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, nickname: true, role: true, createdAt: true },
    });
    return [...dbUsers, ...fallbackUserList.filter((user) => !dbUsers.some((dbUser) => dbUser.email === user.email))];
  } catch {
    return fallbackUserList;
  }
}
