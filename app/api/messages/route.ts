import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { listInbox, sendDirectMessage } from "@/lib/community-social";

const messageSchema = z.object({
  recipientNickname: z.string().trim().min(3).max(24),
  subject: z.string().trim().min(2).max(120),
  content: z.string().trim().min(2).max(5000),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const messages = await listInbox(session.user.id);
  return NextResponse.json({ messages }, { status: 200 });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Please log in." }, { status: 401 });

  try {
    const parsed = messageSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid message." }, { status: 400 });
    const message = await sendDirectMessage({ senderId: session.user.id, ...parsed.data });
    if (!message) return NextResponse.json({ error: "That member could not be found." }, { status: 404 });
    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    console.error("Private message creation failed:", error);
    return NextResponse.json({ error: "The message could not be sent." }, { status: 500 });
  }
}
