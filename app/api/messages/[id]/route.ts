import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markMessageRead } from "@/lib/community-social";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { id } = await context.params;
  await markMessageRead(session.user.id, id);
  return NextResponse.json({ success: true }, { status: 200 });
}
