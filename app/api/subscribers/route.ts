import { NextResponse } from "next/server";
import { z } from "zod";
import { createSubscriber } from "@/lib/community-store";

const subscriberSchema = z.object({
  name: z.string().trim().min(1).max(100).optional().or(z.literal("")),
  email: z.string().trim().email("Please provide a valid email address."),
  source: z.string().trim().max(120).optional().or(z.literal("")),
  interest: z.string().trim().max(200).optional().or(z.literal("")),
});

export async function GET() {
  return NextResponse.json({ ok: true, message: "Subscribers are managed via the admin panel." });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = subscriberSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Please provide valid subscriber information." },
        { status: 400 },
      );
    }

    const subscriber = await createSubscriber({
      email: parsed.data.email,
      name: parsed.data.name || undefined,
      source: parsed.data.source || undefined,
      interest: parsed.data.interest || undefined,
    });

    if (!subscriber) {
      return NextResponse.json({ error: "Unable to save the subscriber." }, { status: 500 });
    }

    return NextResponse.json({ success: true, subscriber }, { status: 201 });
  } catch (error) {
    console.error("Subscriber creation failed:", error);
    return NextResponse.json({ error: "The subscriber form could not be processed." }, { status: 500 });
  }
}
