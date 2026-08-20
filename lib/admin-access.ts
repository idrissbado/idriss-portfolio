import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export type AdminUser = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  passwordHash: string;
  emailVerified?: Date | null;
  verificationTokenHash?: string | null;
  verificationExpiresAt?: Date | null;
};

const fallbackUsers = new Map<string, AdminUser>();

function getFallbackAdminConfig() {
  const email = (process.env.ADMIN_EMAIL || "drissbadoolivier@gmail.com").trim().toLowerCase();
  const name = process.env.ADMIN_NAME || "Driss Olivier Bado";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = process.env.ADMIN_PASSWORD_HASH || bcrypt.hashSync(password, 10);

  return { email, name, passwordHash };
}

export async function findUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const fallbackConfig = getFallbackAdminConfig();

  if (normalizedEmail === fallbackConfig.email) {
    return {
      id: "fallback-admin",
      email: fallbackConfig.email,
      name: fallbackConfig.name,
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

export async function createUserAccount(input: {
  email: string;
  name?: string;
  password: string;
  role?: string;
  emailVerified?: Date | null;
  verificationTokenHash?: string | null;
  verificationExpiresAt?: Date | null;
}) {
  const normalizedEmail = input.email.trim().toLowerCase();
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
      role,
      passwordHash: fallbackConfig.passwordHash,
      emailVerified: emailVerified ?? new Date(),
      verificationTokenHash,
      verificationExpiresAt,
    };
    fallbackUsers.set(normalizedEmail, fallbackUser);
    return fallbackUser;
  }

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        name: input.name || normalizedEmail,
        passwordHash,
        role,
        emailVerified,
        verificationTokenHash,
        verificationExpiresAt,
      },
    });

    return user as AdminUser;
  } catch {
    const fallbackUser: AdminUser = {
      id: `fallback-${Date.now()}`,
      email: normalizedEmail,
      name: input.name || normalizedEmail,
      role,
      passwordHash,
    };
    fallbackUsers.set(normalizedEmail, fallbackUser);
    return fallbackUser;
  }
}

export async function listUsers() {
  const fallbackConfig = getFallbackAdminConfig();
  const fallbackUserList = [
    {
      id: "fallback-admin",
      email: fallbackConfig.email,
      name: fallbackConfig.name,
      role: "admin",
      createdAt: new Date(),
    },
    ...Array.from(fallbackUsers.values()).map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: new Date(),
    })),
  ];

  try {
    const dbUsers = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });
    return [...dbUsers, ...fallbackUserList.filter((user) => !dbUsers.some((dbUser) => dbUser.email === user.email))];
  } catch {
    return fallbackUserList;
  }
}
