import { NextResponse } from "next/server";
import { z } from "zod";
import { createForumReply, getForumTopicBySlug } from "@/lib/community-store";

const replySchema = z.object({
  authorName: z.string().trim().min(2, "Your name is required."),
  authorEmail: z.string().trim().email("Please provide a valid email address.").optional().or(z.literal("")),
  content: z.string().trim().min(2, "A reply cannot be empty."),
});

export async function GET(_request: Request, context: { params: Promise<{ slug: string }> | { slug: string } }) {
  const { slug } = await context.params;
  const topic = await getForumTopicBySlug(slug);

  if (!topic) {
    return NextResponse.json({ error: "Discussion not found." }, { status: 404 });
  }

  return NextResponse.json({ topic }, { status: 200 });
}

export async function POST(request: Request, context: { params: Promise<{ slug: string }> | { slug: string } }) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const parsed = replySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please provide valid reply content." },
        { status: 400 },
      );
    }

    const reply = await createForumReply({
      slug,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail || undefined,
      content: parsed.data.content,
    });

    if (!reply) {
      return NextResponse.json({ error: "The discussion could not be found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, reply }, { status: 201 });
  } catch (error) {
    console.error("Forum reply creation failed:", error);
    return NextResponse.json({ error: "The reply could not be posted." }, { status: 500 });
  }
}
