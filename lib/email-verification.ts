import crypto from "node:crypto";
import { Resend } from "resend";

export function generateVerificationToken() {
  return crypto.randomBytes(32).toString("hex");
}

export function hashVerificationToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export async function sendVerificationEmail({
  name,
  email,
  token,
}: {
  name: string;
  email: string;
  token: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromAddress = process.env.RESEND_FROM ?? "Idriss Olivier Bado <noreply@idrissbado.blog>";
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!apiKey) {
    return false;
  }

  const resend = new Resend(apiKey);
  const verifyUrl = `${siteUrl}/verify-email?token=${encodeURIComponent(token)}`;

  await resend.emails.send({
    from: fromAddress,
    to: [email],
    subject: "Verify your forum account",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.7; color: #111827; max-width: 620px; margin: 0 auto;">
        <h2 style="margin-bottom: 12px;">Verify your account</h2>
        <p>Hello ${name},</p>
        <p>Thanks for creating an account for the forum. Please confirm your email address to activate your membership.</p>
        <p>
          <a href="${verifyUrl}" style="display:inline-block; margin-top:10px; padding: 12px 18px; background:#111827; color:#ffffff; border-radius: 999px; text-decoration:none; font-weight:600;">
            Verify email
          </a>
        </p>
        <p style="margin-top: 18px; font-size: 12px; color: #4b5563;">If you did not create this account, you can ignore this message.</p>
      </div>
    `,
    text: `Hello ${name},\n\nPlease verify your email address here: ${verifyUrl}\n\nIf you did not create this account, ignore this message.`,
  });

  return true;
}
