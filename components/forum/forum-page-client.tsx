"use client";

import Link from "next/link";
import { useState } from "react";
import type { ForumTopic } from "@/lib/community-store";

const defaultForm = {
  title: "",
  authorName: "",
  authorEmail: "",
  category: "General",
  content: "",
};

export function ForumPageClient({ initialTopics }: { initialTopics: ForumTopic[] }) {
  const [topics, setTopics] = useState(initialTopics);
  const [form, setForm] = useState(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const payload = (await response.json()) as { topic?: ForumTopic; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "The discussion could not be published.");
      }

      if (payload.topic) {
        setTopics((current) => [payload.topic!, ...current]);
      }

      setForm(defaultForm);
      setStatus({ type: "success", message: "Your discussion topic has been published." });
    } catch (error) {
      setStatus({
        type: "error",
        message: error instanceof Error ? error.message : "The discussion could not be published.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">Forum</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">Math and ideas in discussion</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-stone-600 dark:text-stone-300">
          A public space for conversations around mathematics, research, statistics, and applied scientific thinking.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-900">
          <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Start a new discussion</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Topic title
              <input
                value={form.title}
                onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                placeholder="A question, paper idea, or reading topic"
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
                placeholder="Describe your question, idea, or reference request..."
                required
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-900"
            >
              {submitting ? "Publishing..." : "Publish discussion"}
            </button>

            {status.message ? (
              <p
                aria-live="polite"
                className={`text-sm ${status.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
              >
                {status.message}
              </p>
            ) : null}
          </form>
        </section>

        <section className="space-y-4">
          {topics.length === 0 ? (
            <div className="rounded-[28px] border border-stone-200 bg-white p-6 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
              No discussions yet. Start the first one.
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

                <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">{topic.excerpt ?? topic.content.slice(0, 180)}</p>

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
