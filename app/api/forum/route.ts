import { NextResponse } from "next/server";
import { z } from "zod";
import { createForumTopic, getForumTopics } from "@/lib/community-store";

const topicSchema = z.object({
  title: z.string().trim().min(3, "A title is required."),
  content: z.string().trim().min(10, "Please add a little more context to the discussion."),
  authorName: z.string().trim().min(2, "Your name is required."),
  authorEmail: z.string().trim().email("Please provide a valid email address.").optional().or(z.literal("")),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1)).max(5).optional(),
  excerpt: z.string().trim().max(250).optional().or(z.literal("")),
});

export async function GET() {
  const topics = await getForumTopics();
  return NextResponse.json({ topics }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const rawTags = Array.isArray(body?.tags)
      ? body.tags
      : typeof body?.tags === "string"
        ? body.tags.split(/[\s,]+/)
        : [];

    const normalizedTags = Array.from(
      new Set(
        rawTags
          .map((tag: unknown) => String(tag ?? "").trim().toLowerCase())
          .filter(Boolean)
          .slice(0, 5),
      ),
    );

    const payload = {
      ...body,
      category: body?.category || normalizedTags[0] || "General",
      tags: normalizedTags,
    };

    const parsed = topicSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please provide valid forum content." },
        { status: 400 },
      );
    }

    const topic = await createForumTopic({
      title: parsed.data.title,
      content: parsed.data.content,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail || undefined,
      category: parsed.data.category || undefined,
      tags: parsed.data.tags,
      excerpt: parsed.data.excerpt || undefined,
    });

    if (!topic) {
      return NextResponse.json({ error: "Unable to publish the discussion." }, { status: 500 });
    }

    return NextResponse.json({ success: true, topic }, { status: 201 });
  } catch (error) {
    console.error("Forum topic creation failed:", error);
    return NextResponse.json({ error: "The discussion could not be published." }, { status: 500 });
  }
}
