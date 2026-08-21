import { NextResponse } from "next/server";
import { z } from "zod";
import {
  AccountConflictError,
  claimGeneratedNickname,
  NicknameClaimError,
} from "@/lib/admin-access";
import { auth } from "@/lib/auth";

const claimSchema = z.object({
  nickname: z.string().trim(),
});

export async function PATCH(request: Request) {
  const session = await auth();

  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Please log in to choose your nickname." }, { status: 401 });
  }

  const parsed = claimSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: "Please enter a valid nickname." }, { status: 400 });
  }

  try {
    const user = await claimGeneratedNickname({
      userId: session.user.id,
      email: session.user.email,
      nickname: parsed.data.nickname,
    });

    return NextResponse.json({
      nickname: user.nickname,
      message: "Your public nickname is now active on your questions and answers.",
    });
  } catch (error) {
    if (error instanceof AccountConflictError && error.field === "nickname") {
      return NextResponse.json(
        { error: "This nickname is already taken. Please choose another one.", field: "nickname" },
        { status: 409 },
      );
    }

    if (error instanceof NicknameClaimError) {
      const status = error.code === "not-found" ? 404 : error.code === "already-claimed" ? 409 : 400;
      return NextResponse.json({ error: error.message, field: "nickname" }, { status });
    }

    console.error("Nickname claim API error:", error);
    return NextResponse.json({ error: "Unable to save your nickname right now." }, { status: 500 });
  }
}
