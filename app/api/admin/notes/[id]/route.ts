import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getResearchNoteById, updateResearchNote } from "@/lib/content-store";

type NoteRouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: NoteRouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: routeId } = await context.params;
    const id = routeId.trim();

    if (!id) {
      return NextResponse.json({ error: "Note id is required." }, { status: 400 });
    }

    const note = await getResearchNoteById(id);
    if (!note) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    return NextResponse.json({ note }, { status: 200 });
  } catch (error) {
    console.error("Fetch note failed:", error);
    return NextResponse.json({ error: "Could not load the note." }, { status: 500 });
  }
}

export async function PUT(request: Request, context: NoteRouteContext) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: routeId } = await context.params;
    const id = routeId.trim();
    if (!id) {
      return NextResponse.json({ error: "Note id is required." }, { status: 400 });
    }

    const body = await request.json();
    const title = String(body?.title ?? "").trim();
    const abstract = String(body?.abstract ?? "").trim();
    const content = String(body?.content ?? "").trim();

    if (!title || !abstract || !content) {
      return NextResponse.json({ error: "Title, abstract, and content are required." }, { status: 400 });
    }

    const updated = await updateResearchNote(id, {
      title,
      subtitle: String(body?.subtitle ?? ""),
      abstract,
      authors: String(body?.authors ?? "Idriss Olivier Bado"),
      subject: String(body?.subject ?? "General"),
      content,
      status: body?.status === "PUBLIC" ? "PUBLIC" : body?.status === "PRIVATE" ? "PRIVATE" : body?.status === "ARCHIVED" ? "ARCHIVED" : "DRAFT",
      tags: Array.isArray(body?.tags) ? body.tags.map(String).filter(Boolean) : [],
      featured: Boolean(body?.featured),
    });

    if (!updated) {
      return NextResponse.json({ error: "Note not found." }, { status: 404 });
    }

    return NextResponse.json({ note: updated }, { status: 200 });
  } catch (error) {
    console.error("Update note failed:", error);
    return NextResponse.json({ error: "Could not update the note." }, { status: 500 });
  }
}
