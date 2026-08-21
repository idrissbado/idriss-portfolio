import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AccountConflictError,
  createUserAccount,
  findUserByEmail,
  findUserByNickname,
} from "@/lib/admin-access";
import { hashVerificationToken, sendVerificationEmail, generateVerificationToken } from "@/lib/email-verification";
import { getNicknameValidationError, normalizeNickname } from "@/lib/nickname";

const registrationSchema = z.object({
  name: z.string().trim().max(100).optional().or(z.literal("")),
  nickname: z.string().trim(),
  email: z.string().trim().email("Please provide a valid email address."),
  password: z.string().min(6, "Password must contain at least 6 characters.").max(128),
});

export async function GET(request: Request) {
  const nickname = normalizeNickname(new URL(request.url).searchParams.get("nickname") ?? "");
  const validationError = getNicknameValidationError(nickname);

  if (validationError) {
    return NextResponse.json({ available: false, error: validationError }, { status: 400 });
  }

  const existingUser = await findUserByNickname(nickname);
  return NextResponse.json({ available: !existingUser, nickname }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const parsed = registrationSchema.safeParse(await request.json());

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please provide valid registration details." },
        { status: 400 },
      );
    }

    const name = parsed.data.name || undefined;
    const nickname = normalizeNickname(parsed.data.nickname);
    const email = parsed.data.email.toLowerCase();
    const password = parsed.data.password;
    const nicknameError = getNicknameValidationError(nickname);

    if (nicknameError) {
      return NextResponse.json({ error: nicknameError, field: "nickname" }, { status: 400 });
    }

    const [existingEmail, existingNickname] = await Promise.all([
      findUserByEmail(email),
      findUserByNickname(nickname),
    ]);

    if (existingEmail) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    if (existingNickname) {
      return NextResponse.json({ error: "This nickname is already taken. Please choose another one.", field: "nickname" }, { status: 409 });
    }

    const token = generateVerificationToken();
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const user = await createUserAccount({
      email,
      name,
      nickname,
      password,
      role: "member",
      emailVerified: null,
      verificationTokenHash: hashVerificationToken(token),
      verificationExpiresAt,
    });

    const sent = await sendVerificationEmail({
      name: user.name ?? user.nickname,
      email: user.email,
      token,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      nickname: user.nickname,
      role: user.role,
      verificationSent: sent,
      message: sent
        ? "Account created. Check your inbox to verify your email before logging in."
        : "Account created, but this environment has no Resend API key configured for verification emails.",
    });
  } catch (error) {
    if (error instanceof AccountConflictError) {
      return NextResponse.json(
        {
          error: error.message,
          field: error.field,
        },
        { status: 409 },
      );
    }

    console.error("Register API error:", error);
    return NextResponse.json({ error: "Unable to create the account." }, { status: 500 });
  }
}
