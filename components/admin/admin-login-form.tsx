"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight, ShieldCheck } from "lucide-react";

export function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("idrissbadoolivier@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_30px_80px_rgba(15,31,60,0.12)] dark:border-stone-800 dark:bg-stone-900 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(46,95,163,0.18),transparent_32%),linear-gradient(135deg,#0f172a,#111827_30%,#1f2a44)] p-8 text-white lg:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(148,163,184,0.08),transparent_50%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-100">
              <ShieldCheck className="h-3.5 w-3.5" />
              Private workspace
            </div>
            <h1 className="mt-6 max-w-md text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Research admin
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-slate-200">
              Manage publications, research notes, projects, and the professional story behind the work.
            </p>

            <div className="mt-10 space-y-4">
              {[
                "Publish and preview research notes",
                "Maintain the academic record",
                "Keep the public profile coherent and premium",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 text-sm text-white">✓</div>
                  <span className="text-sm text-slate-100">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">
              Sign in
            </p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-50">Access the editorial dashboard</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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
                placeholder="Enter your password"
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
              {isSubmitting ? "Checking credentials..." : "Enter dashboard"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-stone-200 pt-4 text-sm text-stone-600 dark:border-stone-800 dark:text-stone-300">
            Use the admin credentials configured in your environment. You can change them in the local app settings at any time.
          </div>
        </div>
      </div>
    </div>
  );
}
