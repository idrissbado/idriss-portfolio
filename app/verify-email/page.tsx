import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { hashVerificationToken } from "@/lib/email-verification";

const verifyText = "verify";
const verifyToken = "token";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }> | { token?: string };
}) {
  const params = searchParams ? await Promise.resolve(searchParams) : {};
  const token = params.token?.trim();

  if (!token) {
    redirect("/login?error=Missing+verification+token");
  }

  try {
    const tokenHash = hashVerificationToken(token);
    const user = await prisma.user.findFirst({
      where: {
        verificationTokenHash: tokenHash,
        verificationExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      redirect("/login?error=This+verification+link+is+invalid+or+expired");
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationTokenHash: null,
        verificationExpiresAt: null,
      },
    });

    redirect("/login?verified=1");
  } catch (error) {
    console.error("Verification failed:", error);
    redirect("/login?error=We+couldn%27t+verify+your+email+right+now");
  }
}
