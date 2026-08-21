import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createForumReply, deleteForumTopic, getForumTopicBySlug, updateForumTopic } from "@/lib/community-store";
import { getPrivateFallbackNickname } from "@/lib/nickname";

const replySchema = z.object({
  content: z.string().trim().min(2, "A reply cannot be empty."),
});

const topicUpdateSchema = z.object({
  title: z.string().trim().min(3, "A title is required.").optional(),
  content: z.string().trim().min(10, "Please add a little more context to the discussion.").optional(),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  excerpt: z.string().trim().max(250).optional().or(z.literal("")),
  imageUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^https?:\/\//i.test(value) || /^data:image\//i.test(value),
      "Please provide a valid image URL or data URL.",
    )
    .optional(),
  imageAltText: z.string().trim().max(120).optional().or(z.literal("")),
});

const moderatorRoles = new Set(["admin", "editor"]);

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
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please log in to post an answer." }, { status: 401 });
    }

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
      authorName: session.user.nickname || getPrivateFallbackNickname(session.user.id),
      authorEmail: session.user.email,
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
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please log in to edit this discussion." }, { status: 401 });
    }

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
      editorEmail: session.user.email,
      editorName: session.user.nickname || getPrivateFallbackNickname(session.user.id),
      isModerator: moderatorRoles.has(session.user.role?.toLowerCase() ?? ""),
      excerpt: parsed.data.excerpt || existing.excerpt || undefined,
      imageUrl: parsed.data.imageUrl || existing.imageUrl || undefined,
      imageAltText: parsed.data.imageAltText || existing.imageAltText || undefined,
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

export async function DELETE(_request: Request, context: { params: Promise<{ slug: string }> | { slug: string } }) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please log in to delete this discussion." }, { status: 401 });
    }

    const { slug } = await context.params;

    const deleted = await deleteForumTopic({
      slug,
      editorEmail: session.user.email,
      editorName: session.user.nickname || getPrivateFallbackNickname(session.user.id),
      isModerator: moderatorRoles.has(session.user.role?.toLowerCase() ?? ""),
    });

    if (!deleted) {
      return NextResponse.json({ error: "You are not allowed to delete this discussion." }, { status: 403 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Forum topic deletion failed:", error);
    return NextResponse.json({ error: "The discussion could not be deleted." }, { status: 500 });
  }
}
