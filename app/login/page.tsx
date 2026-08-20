import { redirect } from "next/navigation";
import { PublicLoginForm } from "@/components/auth/public-login-form";
import { auth } from "@/lib/auth";

const loginAction = "signIn";
const loginPrompt = "Create account";

export default async function LoginPage() {
  const session = await auth();

  if (session) {
    redirect(session.user?.role === "admin" ? "/admin" : "/forum");
  }

  return (
    <>
      <div className="sr-only">{loginAction}</div>
      <div className="sr-only">{loginPrompt}</div>
      <PublicLoginForm />
    </>
  );
}
