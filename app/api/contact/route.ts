import { NextResponse } from "next/server";
import { Resend } from "resend";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(2, "Name must contain at least 2 characters."),
  email: z.string().trim().email("Please provide a valid email address."),
  message: z.string().trim().min(10, "Message must contain at least 10 characters."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = contactSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.issues[0]?.message ?? "Your message is invalid.",
        },
        { status: 400 },
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromAddress = process.env.RESEND_FROM ?? "Idriss Olivier Bado <noreply@idrissbado.blog>";
    const toAddress = process.env.RESEND_TO ?? "idrissbadoolivier@gmail.com";

    if (!apiKey) {
      return NextResponse.json(
        {
          error: "Resend API key is not configured.",
        },
        { status: 500 },
      );
    }

    const resend = new Resend(apiKey);
    const { name, email, message } = parsed.data;

    await resend.emails.send({
      from: fromAddress,
      to: [toAddress],
      replyTo: email,
      subject: `New contact message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto;">
          <h2 style="margin-bottom: 16px;">New contact message</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
      `,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return NextResponse.json({ message: "Your message was sent successfully." }, { status: 200 });
  } catch (error) {
    console.error("Contact form error:", error);

    return NextResponse.json(
      {
        error: "The email service could not send this message right now.",
      },
      { status: 500 },
    );
  }
}
