"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MathRenderer } from "@/components/math/math-renderer";
import type { ForumReplyRecord, ForumTopic } from "@/lib/community-store";

export function ForumThreadPageClient({ topic }: { topic: ForumTopic }) {
  const { data: session, status } = useSession();
  const [replies, setReplies] = useState<ForumReplyRecord[]>(topic.replies);
  const [draft, setDraft] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  useEffect(() => {
    if (!session?.user) {
      return;
    }

    setAuthorName((current) => current || String(session.user?.name ?? ""));
    setAuthorEmail((current) => current || String(session.user?.email ?? ""));
  }, [session]);

  const isAuthenticated = status === "authenticated";

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isAuthenticated) {
      setStatusMessage({
        type: "error",
        message: "Please log in or create an account to reply.",
      });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "idle", message: "" });

    try {
      const response = await fetch(`/api/forum/${topic.slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName.trim() || session?.user?.name || "Community member",
          authorEmail: authorEmail.trim() || session?.user?.email || undefined,
          content: draft,
        }),
      });

      const payload = (await response.json()) as { reply?: ForumReplyRecord; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to publish the reply.");
      }

      if (payload.reply) {
        setReplies((current) => [...current, payload.reply!]);
      }

      setDraft("");
      setAuthorName("");
      setAuthorEmail("");
      setStatusMessage({ type: "success", message: "Your reply has been added." });
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to publish the reply.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-6">
        <Link href="/forum" className="text-sm font-medium text-stone-600 transition hover:text-stone-950 dark:text-stone-300 dark:hover:text-white">
          ← Back to forum
        </Link>
      </div>

      <article className="rounded-[28px] border border-stone-200 bg-white p-6 shadow-[0_20px_60px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-900 sm:p-8">
        <div className="flex items-center justify-between gap-4">
          <span className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
            {topic.category}
          </span>
          <span className="text-xs text-stone-500 dark:text-stone-400">
            {new Date(topic.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </span>
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50">{topic.title}</h1>
        <div className="mt-3 text-sm text-stone-600 dark:text-stone-300">Started by {topic.authorName}</div>
        <div className="mt-6 text-stone-700 dark:text-stone-300">
          <MathRenderer content={topic.content} />
        </div>
      </article>

      <section className="mt-8 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Replies</h2>

        <div className="mt-5 space-y-4">
          {replies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 p-4 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300">
              No replies yet—be the first to contribute.
            </div>
          ) : (
            replies.map((reply) => (
              <div key={reply.id} className="rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
                <div className="flex items-center justify-between gap-4">
                  <div className="font-medium text-stone-900 dark:text-stone-50">{reply.authorName}</div>
                  <div className="text-xs text-stone-500 dark:text-stone-400">
                    {new Date(reply.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </div>
                </div>
                <div className="mt-3 text-stone-700 dark:text-stone-300">
                  <MathRenderer content={reply.content} />
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <section className="mt-8 rounded-[28px] border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
        <h2 className="text-xl font-semibold text-stone-900 dark:text-stone-50">Answer this question</h2>

        {!isAuthenticated ? (
          <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
            <p className="text-sm leading-6 text-stone-700 dark:text-stone-300">
              You need an account to reply. Create one or log in to join the discussion.
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
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Name
                <input
                  value={authorName}
                  onChange={(event) => setAuthorName(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="Your name"
                  required
                />
              </label>
              <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Email
                <input
                  type="email"
                  value={authorEmail}
                  onChange={(event) => setAuthorEmail(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="name@example.com"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-stone-700 dark:text-stone-300">
              Your answer
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className="mt-2 min-h-32 w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                placeholder="Share a reasoning path, a relevant theorem, or a practical method..."
                required
              />
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-900"
            >
              {submitting ? "Posting..." : "Post answer"}
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
    </div>
  );
}
