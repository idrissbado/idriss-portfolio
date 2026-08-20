import { NextResponse } from "next/server";
import { z } from "zod";
import { createForumReply, getForumTopicBySlug, updateForumTopic } from "@/lib/community-store";

const replySchema = z.object({
  authorName: z.string().trim().min(2, "Your name is required."),
  authorEmail: z.string().trim().email("Please provide a valid email address.").optional().or(z.literal("")),
  content: z.string().trim().min(2, "A reply cannot be empty."),
});

const topicUpdateSchema = z.object({
  title: z.string().trim().min(3, "A title is required.").optional(),
  content: z.string().trim().min(10, "Please add a little more context to the discussion.").optional(),
  authorName: z.string().trim().min(2, "Your name is required.").optional(),
  authorEmail: z.string().trim().email("Please provide a valid email address.").optional().or(z.literal("")),
  editorEmail: z.string().trim().email("Please provide a valid email address.").optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  excerpt: z.string().trim().max(250).optional().or(z.literal("")),
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

export async function PATCH(request: Request, context: { params: Promise<{ slug: string }> | { slug: string } }) {
  try {
    const { slug } = await context.params;
    const body = await request.json();
    const parsed = topicUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please provide valid update content." },
        { status: 400 },
      );
    }

    const existing = await getForumTopicBySlug(slug);
    if (!existing) {
      return NextResponse.json({ error: "The discussion could not be found." }, { status: 404 });
    }

    const topic = await updateForumTopic({
      slug,
      title: parsed.data.title ?? existing.title,
      content: parsed.data.content ?? existing.content,
      category: parsed.data.category || existing.category,
      authorName: parsed.data.authorName ?? existing.authorName,
      authorEmail: parsed.data.authorEmail || existing.authorEmail || undefined,
      editorEmail: parsed.data.editorEmail || existing.authorEmail || undefined,
      excerpt: parsed.data.excerpt || existing.excerpt || undefined,
    });

    if (!topic) {
      return NextResponse.json({ error: "You are not allowed to edit this discussion." }, { status: 403 });
    }

    return NextResponse.json({ success: true, topic }, { status: 200 });
  } catch (error) {
    console.error("Forum topic update failed:", error);
    return NextResponse.json({ error: "The discussion could not be updated." }, { status: 500 });
  }
}
