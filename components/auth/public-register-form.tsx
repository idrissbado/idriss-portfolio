"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, AtSign, CheckCircle2, LoaderCircle, ShieldCheck, UserPlus, XCircle } from "lucide-react";
import { useState } from "react";
import { NICKNAME_MAX_LENGTH, NICKNAME_MIN_LENGTH, normalizeNickname } from "@/lib/nickname";

type NicknameStatus = "idle" | "checking" | "available" | "unavailable";

export function PublicRegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [nicknameStatus, setNicknameStatus] = useState<NicknameStatus>("idle");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleNicknameChange(value: string) {
    setNickname(normalizeNickname(value).replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, ""));
    setNicknameStatus("idle");
  }

  async function checkNicknameAvailability() {
    if (nickname.length < NICKNAME_MIN_LENGTH) {
      setNicknameStatus("idle");
      return;
    }

    setNicknameStatus("checking");

    try {
      const response = await fetch(`/api/register?nickname=${encodeURIComponent(nickname)}`);
      const payload = (await response.json()) as { available?: boolean };
      setNicknameStatus(response.ok && payload.available ? "available" : "unavailable");
    } catch {
      setNicknameStatus("idle");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, nickname, email, password }),
      });

      const payload = (await response.json()) as {
        error?: string;
        message?: string;
        field?: string;
      };

      if (!response.ok) {
        if (payload.field === "nickname") {
          setNicknameStatus("unavailable");
        }
        throw new Error(payload.error ?? "Unable to create the account.");
      }

      router.push(`/login?registered=1`);
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
            Keep your private identity secure while your questions, answers, and references stay connected to one public nickname.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-4 text-sm leading-6 text-emerald-50">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-200" />
            Your full name and email remain private. Forum members see only your unique nickname.
          </div>
        </div>

        <div className="p-6 sm:p-8 lg:p-10">
          <div className="mb-8">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">Register</p>
            <h2 className="mt-2 text-3xl font-semibold text-stone-900 dark:text-stone-50">Start participating</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <label htmlFor="register-name" className="block text-sm font-medium text-stone-700 dark:text-stone-200">
              Full name <span className="font-normal text-stone-500">(optional and private)</span>
              <input
                id="register-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-3 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-800"
                placeholder="Jane Doe (optional)"
              />
            </label>

            <div>
              <label htmlFor="register-nickname" className="block text-sm font-medium text-stone-700 dark:text-stone-200">
                Public nickname
              </label>
              <div className="relative mt-2">
                <AtSign className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" aria-hidden="true" />
                <input
                  id="register-nickname"
                  value={nickname}
                  onChange={(event) => handleNicknameChange(event.target.value)}
                  onBlur={() => void checkNicknameAvailability()}
                  autoComplete="nickname"
                  autoCapitalize="none"
                  spellCheck={false}
                  minLength={NICKNAME_MIN_LENGTH}
                  maxLength={NICKNAME_MAX_LENGTH}
                  pattern="[a-z0-9][a-z0-9_-]{2,23}"
                  aria-describedby="nickname-guidance nickname-status"
                  className="w-full rounded-2xl border border-stone-300 bg-stone-50 py-3 pl-10 pr-12 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-3 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-800"
                  placeholder="math-explorer"
                  required
                />
                <span className="absolute inset-y-0 right-4 flex items-center" aria-hidden="true">
                  {nicknameStatus === "checking" ? <LoaderCircle className="h-4 w-4 animate-spin text-stone-400" /> : null}
                  {nicknameStatus === "available" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : null}
                  {nicknameStatus === "unavailable" ? <XCircle className="h-4 w-4 text-rose-600" /> : null}
                </span>
              </div>
              <div id="nickname-guidance" className="mt-2 text-xs leading-5 text-stone-500 dark:text-stone-400">
                3–24 lowercase letters, numbers, hyphens, or underscores. First person to claim it keeps it.
              </div>
              <div id="nickname-status" aria-live="polite" className="mt-1 min-h-5 text-xs font-medium">
                {nicknameStatus === "checking" ? <span className="text-stone-500">Checking availability…</span> : null}
                {nicknameStatus === "available" ? <span className="text-emerald-700 dark:text-emerald-300">Nickname available</span> : null}
                {nicknameStatus === "unavailable" ? <span className="text-rose-700 dark:text-rose-300">Nickname unavailable</span> : null}
              </div>
            </div>

            <label htmlFor="register-email" className="block text-sm font-medium text-stone-700 dark:text-stone-200">
              Email <span className="font-normal text-stone-500">(private)</span>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-900 outline-none transition focus:border-stone-500 focus:ring-3 focus:ring-stone-200 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-100 dark:focus:border-stone-500 dark:focus:ring-stone-800"
                placeholder="you@example.com"
                required
              />
            </label>

            <label htmlFor="register-password" className="block text-sm font-medium text-stone-700 dark:text-stone-200">
              Password
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
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
