import { NextResponse } from "next/server";
import { createUserAccount, findUserByEmail } from "@/lib/admin-access";

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

    const user = await createUserAccount({
      email,
      name: name || email,
      password,
      role: "member",
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });
  } catch (error) {
    console.error("Register API error:", error);
    return NextResponse.json({ error: "Unable to create the account." }, { status: 500 });
  }
}
