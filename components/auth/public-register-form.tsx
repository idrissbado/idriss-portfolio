"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, UserPlus } from "lucide-react";
import { useState } from "react";

export function PublicRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to create the account.");
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error("Your account was created, but the login failed. Please sign in manually.");
      }

      router.push("/forum");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create the account.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-4xl overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_30px_80px_rgba(15,31,60,0.12)] dark:border-stone-800 dark:bg-stone-900 lg:grid-cols-[1fr_1fr]">
        <div className="bg-[radial-gradient(circle_at_top_left,_rgba(14,116,144,0.18),transparent_32%),linear-gradient(135deg,#0f172a,#111827_30%,#1f2a44)] p-8 text-white lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-100">
            <UserPlus className="h-3.5 w-3.5" />
            New member
          </div>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Create your account
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
            Join the community with a real account so your questions, answers, and references stay connected to you.
          </p>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">Register</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-50">Start participating</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
              Full name
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-3 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-800"
                placeholder="Jane Doe"
                required
              />
            </label>

            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
              Email
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-3 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-800"
                placeholder="you@example.com"
                required
              />
            </label>

            <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-3 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-800"
                placeholder="Choose a strong password"
                minLength={6}
                required
              />
            </label>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-950 dark:hover:bg-stone-300"
            >
              {isSubmitting ? "Creating account..." : "Create account"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 text-sm text-stone-600 dark:text-stone-300">
            Already have an account? <Link href="/login" className="font-semibold text-stone-900 underline-offset-4 hover:underline dark:text-stone-100">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
