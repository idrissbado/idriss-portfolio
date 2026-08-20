import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createResearchNote } from "@/lib/content-store";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const title = String(body?.title ?? "").trim();
    const abstract = String(body?.abstract ?? "").trim();
    const content = String(body?.content ?? "").trim();
    const authors = String(body?.authors ?? "Idriss Olivier Bado").trim();
    const subject = String(body?.subject ?? "General").trim();
    const subtitle = String(body?.subtitle ?? "").trim();
    const status = body?.status === "PUBLIC" ? "PUBLIC" : "DRAFT";
    const tags = Array.isArray(body?.tags) ? body.tags.map(String).filter(Boolean) : [subject || "General"];

    if (!title || !abstract || !content) {
      return NextResponse.json({ error: "Title, abstract, and content are required." }, { status: 400 });
    }

    const created = await createResearchNote({
      title,
      subtitle: subtitle || undefined,
      abstract,
      authors,
      subject,
      content,
      status,
      tags,
      featured: Boolean(body?.featured),
    });

    if (!created) {
      return NextResponse.json({ error: "Could not save the note to the database." }, { status: 500 });
    }

    return NextResponse.json({ success: true, note: created }, { status: 200 });
  } catch (error) {
    console.error("Note creation failed:", error);
    return NextResponse.json({ error: "Could not save the article." }, { status: 500 });
  }
}
