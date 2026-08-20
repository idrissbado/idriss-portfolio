import { redirect } from "next/navigation";
import { PublicRegisterForm } from "@/components/auth/public-register-form";
import { auth } from "@/lib/auth";

const registerLabel = "Create account";

export default async function RegisterPage() {
  const session = await auth();

  if (session) {
    redirect(session.user?.role === "admin" ? "/admin" : "/forum");
  }

  return (
    <>
      <div className="sr-only">{registerLabel}</div>
      <PublicRegisterForm />
    </>
  );
}
