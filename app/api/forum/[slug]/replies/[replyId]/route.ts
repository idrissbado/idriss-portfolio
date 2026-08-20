import { NextResponse } from "next/server";
import { z } from "zod";
import { deleteForumReply, updateForumReply } from "@/lib/community-store";

const replyUpdateSchema = z.object({
  content: z.string().trim().min(2, "A reply cannot be empty.").optional(),
  authorName: z.string().trim().min(2, "Your name is required.").optional(),
  authorEmail: z.string().trim().email("Please provide a valid email address.").optional().or(z.literal("")),
  editorEmail: z.string().trim().email("Please provide a valid email address.").optional().or(z.literal("")),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string; replyId: string }> | { slug: string; replyId: string } },
) {
  try {
    const { slug, replyId } = await context.params;
    const body = await request.json();
    const parsed = replyUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please provide valid reply content." },
        { status: 400 },
      );
    }

    const reply = await updateForumReply({
      slug,
      replyId,
      content: parsed.data.content,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail || undefined,
      editorEmail: parsed.data.editorEmail || undefined,
    });

    if (!reply) {
      return NextResponse.json({ error: "You are not allowed to edit this reply." }, { status: 403 });
    }

    return NextResponse.json({ success: true, reply }, { status: 200 });
  } catch (error) {
    console.error("Forum reply update failed:", error);
    return NextResponse.json({ error: "The reply could not be updated." }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ slug: string; replyId: string }> | { slug: string; replyId: string } },
) {
  try {
    const { slug, replyId } = await context.params;
    const body = await request.json().catch(() => ({}));
    const authorEmail = typeof body?.authorEmail === "string" ? body.authorEmail.trim() : undefined;
    const editorEmail = typeof body?.editorEmail === "string" ? body.editorEmail.trim() : undefined;
    const authorName = typeof body?.authorName === "string" ? body.authorName.trim() : undefined;

    const deleted = await deleteForumReply({
      slug,
      replyId,
      authorEmail,
      editorEmail,
      authorName,
    });

    if (!deleted) {
      return NextResponse.json({ error: "You are not allowed to delete this reply." }, { status: 403 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Forum reply deletion failed:", error);
    return NextResponse.json({ error: "The reply could not be deleted." }, { status: 500 });
  }
}
