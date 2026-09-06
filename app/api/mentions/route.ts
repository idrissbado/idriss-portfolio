import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUnreadSocialCount } from "@/lib/community-social";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const [mentions, unread] = await Promise.all([
    prisma.forumMention.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 100 }),
    getUnreadSocialCount(session.user.id),
  ]);
  return NextResponse.json({ mentions, unread }, { status: 200 });
}
