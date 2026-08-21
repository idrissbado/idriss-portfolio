import { PublicLoginForm } from "@/components/auth/public-login-form";

const loginAction = "signIn";
const loginPrompt = "Create account";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ verified?: string; registered?: string; error?: string }> | { verified?: string; registered?: string; error?: string };
}) {
  const params = searchParams ? await Promise.resolve(searchParams) : {};
  const verified = params.verified === "1";
  const registered = params.registered === "1";
  const errorMessage = params.error;

  return (
    <>
      <div className="sr-only">{loginAction}</div>
      <div className="sr-only">{loginPrompt}</div>
      <div className="mx-auto max-w-5xl px-4 pt-8 sm:px-6 lg:px-8">
        {verified ? (
          <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200">
            Your email address was verified successfully. You can now sign in.
          </div>
        ) : null}
        {registered ? (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200">
            Your account was created. Check your email and verify the address before logging in.
          </div>
        ) : null}
        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {errorMessage}
          </div>
        ) : null}
      </div>
      <PublicLoginForm />
    </>
  );
}
