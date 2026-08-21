import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { deleteForumReply, updateForumReply } from "@/lib/community-store";

const replyUpdateSchema = z.object({
  content: z.string().trim().min(2, "A reply cannot be empty."),
});

const moderatorRoles = new Set(["admin", "editor"]);

export async function PATCH(
  request: Request,
  context: { params: Promise<{ slug: string; replyId: string }> | { slug: string; replyId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please log in to edit an answer." }, { status: 401 });
    }

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
      editorEmail: session.user.email,
      editorName: session.user.name ?? undefined,
      isModerator: moderatorRoles.has(session.user.role?.toLowerCase() ?? ""),
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
  _request: Request,
  context: { params: Promise<{ slug: string; replyId: string }> | { slug: string; replyId: string } },
) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Please log in to delete an answer." }, { status: 401 });
    }

    const { slug, replyId } = await context.params;

    const deleted = await deleteForumReply({
      slug,
      replyId,
      editorEmail: session.user.email,
      editorName: session.user.name ?? undefined,
      isModerator: moderatorRoles.has(session.user.role?.toLowerCase() ?? ""),
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
