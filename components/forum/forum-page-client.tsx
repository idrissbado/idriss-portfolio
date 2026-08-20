"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MathRenderer } from "@/components/math/math-renderer";
import type { ForumTopic } from "@/lib/community-store";

const defaultForm = {
  title: "",
  authorName: "",
  authorEmail: "",
  category: "General",
  content: "",
};

export function ForumPageClient({ initialTopics }: { initialTopics: ForumTopic[] }) {
  const { data: session, status } = useSession();
  const [topics, setTopics] = useState(initialTopics);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    setForm((current) => ({
      ...current,
      authorName: current.authorName || String(session.user?.name ?? ""),
      authorEmail: current.authorEmail || String(session.user?.email ?? ""),
    }));
  }, [session]);

  const isAuthenticated = status === "authenticated";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setStatusMessage({
        type: "error",
        message: "Please log in or create an account before posting a question.",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          authorName: form.authorName || session?.user?.name || "Community member",
          authorEmail: form.authorEmail || session?.user?.email || undefined,
        }),
      });

      const payload = (await response.json()) as { topic?: ForumTopic; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "The question could not be published.");
      }

      if (payload.topic) {
        setTopics((current) => [payload.topic!, ...current]);
      }

      setForm(defaultForm);
      setStatusMessage({ type: "success", message: "Your question has been published." });
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "The question could not be published.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="forum-shell mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="premium-surface mb-10 rounded-[32px] border border-stone-200/80 bg-white/75 p-6 shadow-[0_25px_80px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/75 sm:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-stone-500">Member forum</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 sm:text-5xl">Ask sharp questions. Build rigorous answers.</h1>
          </div>
          {!isAuthenticated ? (
            <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-950">
              Create account
            </Link>
          ) : null}
        </div>
        <p className="mt-5 max-w-3xl text-base leading-7 text-stone-600 dark:text-stone-300">
          A premium community for mathematics, modeling, statistics, AI, and research discussion—designed for serious ideas and clearer reasoning.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-900">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Ask a question</h2>
            {isAuthenticated ? (
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                Logged in
              </span>
            ) : null}
          </div>

          {!isAuthenticated ? (
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
              <p className="text-sm leading-6 text-stone-700 dark:text-stone-300">
                Sign in to ask questions, answer others, and keep your posts tied to your account.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href="/login" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900">
                  Log in
                </Link>
                <Link href="/register" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500 hover:text-stone-950 dark:border-stone-700 dark:text-stone-200 dark:hover:border-stone-500 dark:hover:text-white">
                  Create account
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Question title
                <input
                  value={form.title}
                  onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="Example: Are there compactness conditions that guarantee uniqueness?"
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Your name
                  <input
                    value={form.authorName}
                    onChange={(event) => setForm((current) => ({ ...current, authorName: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                    placeholder="Jane Doe"
                    required
                  />
                </label>
                <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                  Email
                  <input
                    type="email"
                    value={form.authorEmail}
                    onChange={(event) => setForm((current) => ({ ...current, authorEmail: event.target.value }))}
                    className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                    placeholder="name@example.com"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Category
                <select
                  value={form.category}
                  onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                >
                  <option value="General">General</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Statistics">Statistics</option>
                  <option value="AI">AI</option>
                  <option value="Resources">Resources</option>
                </select>
              </label>

              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Details
                <textarea
                  value={form.content}
                  onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                  className="mt-2 min-h-32 w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="Describe your question and what you have already explored..."
                  required
                />
              </label>

              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-900"
              >
                {submitting ? "Publishing..." : "Publish question"}
              </button>
            </form>
          )}

          {statusMessage.message ? (
            <p
              aria-live="polite"
              className={`mt-4 text-sm ${statusMessage.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
            >
              {statusMessage.message}
            </p>
          ) : null}
        </section>

        <section className="space-y-4">
          {topics.length === 0 ? (
            <div className="rounded-[28px] border border-stone-200 bg-white p-6 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
              No questions yet. The first post will open the thread.
            </div>
          ) : (
            topics.map((topic) => (
              <article key={topic.id} className="rounded-[28px] border border-stone-200 bg-white p-5 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                <div className="flex items-center justify-between gap-4">
                  <span className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                    {topic.category}
                  </span>
                  <span className="text-xs text-stone-500 dark:text-stone-400">
                    {topic.replies.length} {topic.replies.length === 1 ? "reply" : "replies"}
                  </span>
                </div>

                <Link href={`/forum/${topic.slug}`} className="mt-4 block text-2xl font-semibold leading-tight text-stone-900 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200">
                  {topic.title}
                </Link>

                <div className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                  <MathRenderer content={topic.excerpt ?? `${topic.content.slice(0, 180)}${topic.content.length > 180 ? "..." : ""}`} />
                </div>

                <div className="mt-5 flex items-center justify-between gap-4 border-t border-stone-200 pt-4 dark:border-stone-800">
                  <div>
                    <div className="text-sm font-medium text-stone-800 dark:text-stone-100">{topic.authorName}</div>
                    <div className="text-xs text-stone-500 dark:text-stone-400">
                      {new Date(topic.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                  </div>
                  <Link href={`/forum/${topic.slug}`} className="text-sm font-medium text-stone-700 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
                    View thread
                  </Link>
                </div>
              </article>
            ))
          )}
        </section>
      </div>
    </div>
  );
}
