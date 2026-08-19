"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { ArrowRight, BookOpenText, LockKeyhole, NotebookPen, Sparkles } from "lucide-react";

const featureList = [
  "Publish and preview research notes",
  "Manage publications and writing projects",
  "Keep your public profile coherent and premium",
];

export function LoginShowcase() {
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
      setError("Identifiants invalides. Vérifiez votre email et votre mot de passe.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-170px)] max-w-7xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid w-full max-w-6xl overflow-hidden rounded-[32px] border border-stone-200 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.12)] lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(15,118,110,0.20),transparent_28%),linear-gradient(135deg,#0f172a_0%,#111827_30%,#16263f_100%)] p-8 text-white sm:p-10">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05),transparent_52%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/7 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-100">
              <LockKeyhole className="h-3.5 w-3.5" />
              Private editorial access
            </div>

            <h1 className="mt-6 max-w-lg text-4xl font-semibold tracking-tight text-white sm:text-5xl">
              Write your research, publish with clarity.
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-200">
              A premium workspace for articles, notes, and thought leadership built for serious academic and technical storytelling.
            </p>

            <div className="mt-9 space-y-4">
              {featureList.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-4 py-3 backdrop-blur-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <span className="text-sm text-slate-100">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                <NotebookPen className="h-5 w-5 text-teal-200" />
                <div className="mt-3 text-2xl font-semibold text-white">Notes</div>
                <div className="mt-1 text-sm text-slate-200">Drafts, previews, and publication flow.</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
                <BookOpenText className="h-5 w-5 text-sky-200" />
                <div className="mt-3 text-2xl font-semibold text-white">Editorial</div>
                <div className="mt-1 text-sm text-slate-200">Academic language with a luxury digital feel.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center p-6 sm:p-8 lg:p-10">
          <div className="w-full max-w-md">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500">Sign in</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-stone-900">Access the dashboard</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <label className="block text-sm font-medium text-stone-700">
                Email
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none ring-0 transition focus:border-stone-500 focus:bg-white"
                  placeholder="idrissbadoolivier@gmail.com"
                  required
                />
              </label>

              <label className="block text-sm font-medium text-stone-700">
                Password
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none ring-0 transition focus:border-stone-500 focus:bg-white"
                  placeholder="Enter your password"
                  required
                />
              </label>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-stone-900 px-5 py-3.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? "Checking credentials..." : "Open workspace"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
              You can change the admin credentials in your local environment or app settings at any time.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
