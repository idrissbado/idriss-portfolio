"use client";

import Link from "next/link";
import {
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  UserPlus,
} from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const memberBenefits = [
  "Write polished questions and answers with Markdown and LaTeX",
  "Discuss proofs, references, and research methods",
  "Build a trusted profile around your contributions",
];

function getInitials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "M"
  );
}

export function PublicLoginForm() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password. Check your details and try again.");
        return;
      }

      router.push("/forum");
      router.refresh();
    } catch {
      setError("We could not sign you in right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignOut() {
    setIsSigningOut(true);

    try {
      await signOut({ redirect: false });
      router.refresh();
    } finally {
      setIsSigningOut(false);
    }
  }

  const memberName = session?.user?.name || session?.user?.email || "Member";
  const memberRole = session?.user?.role || "member";

  return (
    <div className="mx-auto flex min-h-[72vh] max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid min-w-0 w-full max-w-5xl overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_30px_80px_rgba(15,31,60,0.12)] dark:border-stone-800 dark:bg-stone-900 lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative min-w-0 overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(45,212,191,0.2),transparent_34%),linear-gradient(135deg,#0f172a,#111827_35%,#243047)] p-8 text-white lg:p-10">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-white/10" />
          <div className="absolute -bottom-28 -left-20 h-64 w-64 rounded-full bg-cyan-300/[0.08] blur-2xl" />

          <div className="relative flex h-full min-w-0 flex-col">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-100 backdrop-blur-sm">
              <LockKeyhole className="h-3.5 w-3.5" />
              Research member portal
            </div>

            <h1 className="mt-7 max-w-md break-words text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Your portal to serious mathematical discussion.
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
              One secure account for asking questions, publishing answers, and joining focused research conversations.
            </p>

            <div className="mt-9 space-y-3">
              {memberBenefits.map((item) => (
                <div
                  key={item}
                  className="flex min-w-0 items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.06] px-4 py-3 backdrop-blur-sm"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-300/15 text-emerald-200">
                    <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
                  </span>
                  <span className="min-w-0 text-sm leading-6 text-slate-100">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-9">
              <div className="flex min-w-0 items-center gap-3 border-t border-white/10 pt-5 text-xs leading-5 text-slate-300">
                <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-200" />
                <span className="min-w-0">Your member identity stays connected to every contribution you publish.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex min-h-[590px] min-w-0 items-center p-6 sm:p-8 lg:p-10">
          {status === "loading" ? (
            <div aria-label="Loading your account" className="w-full animate-pulse space-y-5">
              <div className="h-3 w-28 rounded-full bg-stone-200 dark:bg-stone-800" />
              <div className="h-9 w-56 rounded-xl bg-stone-200 dark:bg-stone-800" />
              <div className="h-28 rounded-3xl bg-stone-100 dark:bg-stone-950" />
              <div className="h-12 rounded-2xl bg-stone-200 dark:bg-stone-800" />
              <div className="h-12 rounded-2xl bg-stone-100 dark:bg-stone-950" />
            </div>
          ) : session?.user ? (
            <div className="w-full">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700 dark:text-emerald-300">
                Signed in securely
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                Welcome back.
              </h2>
              <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">
                Continue to your community or securely end this session here.
              </p>

              <div className="mt-7 rounded-3xl border border-stone-200 bg-stone-50 p-5 dark:border-stone-800 dark:bg-stone-950">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-stone-900 text-sm font-bold uppercase text-white shadow-sm dark:bg-stone-100 dark:text-stone-900">
                    {getInitials(memberName)}
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-base font-semibold text-stone-900 dark:text-stone-100">
                      {memberName}
                    </div>
                    {session.user.name && session.user.email ? (
                      <div className="mt-0.5 truncate text-xs text-stone-500 dark:text-stone-400">
                        {session.user.email}
                      </div>
                    ) : null}
                    <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      {memberRole}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Link
                  href="/forum"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-300"
                >
                  Continue to forum
                  <ArrowRight className="h-4 w-4" />
                </Link>

                {memberRole.toLowerCase() === "admin" ? (
                  <Link
                    href="/admin"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-stone-300 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:text-stone-950 dark:border-stone-700 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:text-white"
                  >
                    Open administration
                    <ShieldCheck className="h-4 w-4" />
                  </Link>
                ) : null}

                <button
                  type="button"
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 transition hover:border-rose-300 hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300 dark:hover:bg-rose-950/50"
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? "Signing out..." : "Log out securely"}
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-8">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
                  Member sign in
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
                  Welcome back.
                </h2>
                <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-400">
                  Enter your details to answer questions and manage your contributions.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label htmlFor="member-email" className="block text-sm font-medium text-stone-700 dark:text-stone-200">
                    Email address
                  </label>
                  <input
                    id="member-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-3 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-800"
                    placeholder="you@example.com"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="member-password" className="block text-sm font-medium text-stone-700 dark:text-stone-200">
                    Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      id="member-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      autoComplete="current-password"
                      className="w-full rounded-2xl border border-stone-300 bg-stone-50 py-3 pl-4 pr-12 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-500 focus:ring-3 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-800"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      aria-pressed={showPassword}
                      className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {error ? (
                  <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-300"
                >
                  {isSubmitting ? "Checking credentials..." : "Log in to your portal"}
                  <ArrowRight className="h-4 w-4" />
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center gap-3 border-t border-stone-200 pt-6 text-sm dark:border-stone-800">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 font-semibold text-stone-900 underline-offset-4 hover:underline dark:text-stone-100"
                >
                  <UserPlus className="h-4 w-4" />
                  Create a member account
                </Link>
                <Link href="/forum" className="text-stone-500 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-white">
                  Browse the public forum
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
