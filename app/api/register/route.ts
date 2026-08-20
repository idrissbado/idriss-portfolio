import { NextResponse } from "next/server";
import { createUserAccount, findUserByEmail } from "@/lib/admin-access";
import { hashVerificationToken, sendVerificationEmail, generateVerificationToken } from "@/lib/email-verification";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { name?: string; email?: string; password?: string };
    const name = body.name?.trim();
    const email = body.email?.trim().toLowerCase();
    const password = body.password ?? "";

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "Please provide a valid email and a password with at least 6 characters." }, { status: 400 });
    }

    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const token = generateVerificationToken();
    const verificationExpiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24);
    const user = await createUserAccount({
      email,
      name: name || email,
      password,
      role: "member",
      emailVerified: null,
      verificationTokenHash: hashVerificationToken(token),
      verificationExpiresAt,
    });

    const sent = await sendVerificationEmail({
      name: user.name ?? "Community member",
      email: user.email,
      token,
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      verificationSent: sent,
      message: sent
        ? "Account created. Check your inbox to verify your email before logging in."
        : "Account created, but this environment has no Resend API key configured for verification emails.",
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Unable to create the account." }, { status: 500 });
  }
}
