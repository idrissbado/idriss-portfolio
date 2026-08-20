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

  let redirectTo = "/login?verified=1";

  try {
    const tokenHash = hashVerificationToken(token);
    const user = await prisma.user.findFirst({
      where: {
        verificationTokenHash: tokenHash,
        verificationExpiresAt: { gt: new Date() },
      },
    });

    if (!user) {
      redirectTo = "/login?error=This+verification+link+is+invalid+or+expired";
    } else {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          verificationTokenHash: null,
          verificationExpiresAt: null,
        },
      });
    }
  } catch (error) {
    console.error("Verification failed:", error);
    redirectTo = "/login?error=We+couldn%27t+verify+your+email+right+now";
  }

  redirect(redirectTo);
}
