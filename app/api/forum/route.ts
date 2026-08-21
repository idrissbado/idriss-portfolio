import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createForumTopic, getForumTopics } from "@/lib/community-store";
import { getPrivateFallbackNickname } from "@/lib/nickname";

const topicSchema = z.object({
  title: z.string().trim().min(3, "A title is required."),
  content: z.string().trim().min(10, "Please add a little more context to the discussion."),
  category: z.string().trim().max(60).optional().or(z.literal("")),
  tags: z.array(z.string().trim().min(1)).max(5).optional(),
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

export async function GET() {
  const topics = await getForumTopics();
  return NextResponse.json({ topics }, { status: 200 });
}

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please log in to publish a question." }, { status: 401 });
    }

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
      imageUrl: typeof body?.imageUrl === "string" ? body.imageUrl.trim() : "",
      imageAltText: typeof body?.imageAltText === "string" ? body.imageAltText.trim() : "",
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
      authorName: session.user.nickname || getPrivateFallbackNickname(session.user.id),
      authorEmail: session.user.email,
      category: parsed.data.category || undefined,
      tags: parsed.data.tags,
      excerpt: parsed.data.excerpt || undefined,
      imageUrl: parsed.data.imageUrl || undefined,
      imageAltText: parsed.data.imageAltText || undefined,
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
