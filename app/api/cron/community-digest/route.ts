import { NextResponse } from "next/server";
import { sendCommunityDigest } from "@/lib/community-digest";

export const runtime = "nodejs";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const kind = new URL(request.url).searchParams.get("kind") === "daily" ? "daily" : "weekly";
  const result = await sendCommunityDigest(kind);
  return NextResponse.json({ kind, ...result }, { status: 200 });
}
