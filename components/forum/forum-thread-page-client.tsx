"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { MathRenderer } from "@/components/math/math-renderer";
import type { ForumReplyRecord, ForumTopic } from "@/lib/community-store";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "M";
}

export function ForumThreadPageClient({ topic }: { topic: ForumTopic }) {
  const { data: session, status } = useSession();
  const [question, setQuestion] = useState<ForumTopic>(topic);
  const [replies, setReplies] = useState<ForumReplyRecord[]>(topic.replies);
  const [draft, setDraft] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState({ title: topic.title, content: topic.content, category: topic.category });
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
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
  const canEditQuestion = isAuthenticated && (
    (session?.user?.email && question.authorEmail && session.user.email.toLowerCase() === question.authorEmail.toLowerCase()) ||
    (session?.user?.name && question.authorName && session.user.name.trim().toLowerCase() === question.authorName.trim().toLowerCase())
  );
  const canEditReply = (reply: ForumReplyRecord) => isAuthenticated && (
    (session?.user?.email && reply.authorEmail && session.user.email.toLowerCase() === reply.authorEmail.toLowerCase()) ||
    (session?.user?.name && reply.authorName && session.user.name.trim().toLowerCase() === reply.authorName.trim().toLowerCase())
  );
  const votes = Math.max(replies.length + 1, 1);

  const handleQuestionUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canEditQuestion) {
      setStatusMessage({ type: "error", message: "You can only edit your own question." });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "idle", message: "" });

    try {
      const response = await fetch(`/api/forum/${question.slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: questionDraft.title,
          content: questionDraft.content,
          category: questionDraft.category,
          authorName: session?.user?.name || question.authorName,
          authorEmail: session?.user?.email || question.authorEmail || undefined,
          editorEmail: session?.user?.email || question.authorEmail || undefined,
        }),
      });

      const payload = (await response.json()) as { topic?: ForumTopic; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update the question.");
      }

      if (payload.topic) {
        setQuestion(payload.topic);
        setQuestionDraft({ title: payload.topic.title, content: payload.topic.content, category: payload.topic.category });
      }

      setIsEditingQuestion(false);
      setStatusMessage({ type: "success", message: "Your question was updated." });
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update the question.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!canEditQuestion) {
      setStatusMessage({ type: "error", message: "You can only delete your own question." });
      return;
    }

    const confirmed = window.confirm("Delete this question permanently?");
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "idle", message: "" });

    try {
      const response = await fetch(`/api/forum/${question.slug}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: question.authorName,
          authorEmail: question.authorEmail || session?.user?.email || undefined,
          editorEmail: session?.user?.email || question.authorEmail || undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete the question.");
      }

      setStatusMessage({ type: "success", message: "The question was deleted." });
      window.location.href = "/forum";
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to delete the question.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyUpdate = async (replyId: string) => {
    const updatedContent = (replyDrafts[replyId] ?? "").trim();
    const targetReply = replies.find((reply) => reply.id === replyId);

    if (!targetReply) {
      return;
    }

    if (!updatedContent) {
      setStatusMessage({ type: "error", message: "Reply content cannot be empty." });
      return;
    }

    if (!canEditReply(targetReply)) {
      setStatusMessage({ type: "error", message: "You can only edit your own reply." });
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "idle", message: "" });

    try {
      const response = await fetch(`/api/forum/${question.slug}/replies/${replyId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: updatedContent,
          authorName: session?.user?.name || targetReply.authorName,
          authorEmail: session?.user?.email || targetReply.authorEmail || undefined,
          editorEmail: session?.user?.email || targetReply.authorEmail || undefined,
        }),
      });

      const payload = (await response.json()) as { reply?: ForumReplyRecord; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update the reply.");
      }

      if (payload.reply) {
        setReplies((current) => current.map((reply) => reply.id === replyId ? payload.reply! : reply));
      }

      setEditingReplyId(null);
      setReplyDrafts((current) => ({ ...current, [replyId]: "" }));
      setStatusMessage({ type: "success", message: "Your reply was updated." });
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to update the reply.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReplyDelete = async (replyId: string) => {
    const targetReply = replies.find((reply) => reply.id === replyId);
    if (!targetReply) {
      return;
    }

    if (!canEditReply(targetReply)) {
      setStatusMessage({ type: "error", message: "You can only delete your own reply." });
      return;
    }

    const confirmed = window.confirm("Delete this reply permanently?");
    if (!confirmed) {
      return;
    }

    setSubmitting(true);
    setStatusMessage({ type: "idle", message: "" });

    try {
      const response = await fetch(`/api/forum/${question.slug}/replies/${replyId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: targetReply.authorName,
          authorEmail: targetReply.authorEmail || session?.user?.email || undefined,
          editorEmail: session?.user?.email || targetReply.authorEmail || undefined,
        }),
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete the reply.");
      }

      setReplies((current) => current.filter((reply) => reply.id !== replyId));
      setStatusMessage({ type: "success", message: "The reply was deleted." });
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Unable to delete the reply.",
      });
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="forum-shell min-h-screen bg-[#f5f1ec]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <Link href="/forum" className="inline-flex items-center gap-2 rounded-full border border-stone-200 bg-white px-3 py-2 text-sm font-medium text-stone-700 transition hover:border-stone-400 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200 dark:hover:text-white">
            ← Back to forum
          </Link>
          <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
            Member-only
          </div>
        </div>

        <article className="premium-surface forum-panel-glow rounded-[32px] border border-stone-200 bg-white/85 p-6 shadow-[0_25px_70px_rgba(15,23,42,0.06)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/85 sm:p-8">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="forum-badge rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                  {question.category}
                </span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {new Date(question.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              </div>

              {isEditingQuestion ? (
                <form onSubmit={handleQuestionUpdate} className="mt-4 space-y-4">
                  <input
                    value={questionDraft.title}
                    onChange={(event) => setQuestionDraft((current) => ({ ...current, title: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-xl font-semibold outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                    required
                  />
                  <input
                    value={questionDraft.category}
                    onChange={(event) => setQuestionDraft((current) => ({ ...current, category: event.target.value }))}
                    className="w-full rounded-2xl border border-stone-300 bg-stone-50 px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                    placeholder="Category"
                  />
                  <textarea
                    value={questionDraft.content}
                    onChange={(event) => setQuestionDraft((current) => ({ ...current, content: event.target.value }))}
                    className="min-h-[220px] w-full rounded-[22px] border border-stone-300 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                    required
                  />
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={submitting} className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-900">
                      {submitting ? "Saving..." : "Save changes"}
                    </button>
                    <button type="button" onClick={() => { setIsEditingQuestion(false); setQuestionDraft({ title: question.title, content: question.content, category: question.category }); }} className="rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:text-stone-200">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl">
                    {question.title}
                  </h1>

                  <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-500 text-[11px] font-semibold uppercase text-white dark:from-stone-100 dark:to-stone-500 dark:text-stone-950">
                      {getInitials(question.authorName || "Member")}
                    </div>
                    <div>
                      <div className="font-medium text-stone-900 dark:text-stone-50">{question.authorName}</div>
                      <div className="text-xs text-stone-500 dark:text-stone-400">Member · Research discussion</div>
                    </div>
                    {canEditQuestion ? (
                      <div className="ml-auto flex gap-2">
                        <button type="button" onClick={() => setIsEditingQuestion(true)} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:text-stone-200">
                          Edit question
                        </button>
                        <button type="button" onClick={handleDeleteQuestion} className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-400 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                          Delete
                        </button>
                      </div>
                    ) : null}
                  </div>
                </>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3 sm:min-w-[260px]">
              {[
                { label: "Votes", value: votes },
                { label: "Answers", value: replies.length },
                { label: "Views", value: Math.max(replies.length * 17 + 33, 42) },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-stone-200 bg-stone-50/80 px-3 py-3 text-center shadow-inner dark:border-stone-800 dark:bg-stone-950/60">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">{stat.label}</div>
                  <div className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-[90px_minmax(0,1fr)]">
            <div className="flex flex-col items-center gap-2 rounded-[24px] border border-stone-200 bg-stone-50 px-2 py-4 dark:border-stone-800 dark:bg-stone-950/60">
              <button type="button" className="text-2xl text-stone-400 transition hover:text-stone-700 dark:hover:text-stone-100">▲</button>
              <div className="text-2xl font-semibold text-stone-900 dark:text-stone-50">{votes}</div>
              <button type="button" className="text-2xl text-stone-400 transition hover:text-stone-700 dark:hover:text-stone-100">▼</button>
            </div>

            <div className="rounded-[28px] border border-stone-200 bg-gradient-to-br from-stone-50 to-white p-5 text-stone-700 shadow-inner dark:border-stone-800 dark:from-stone-950/80 dark:to-stone-900/70 dark:text-stone-300">
              <MathRenderer content={question.content} />
            </div>
          </div>
        </article>

        <section className="mt-8 rounded-[28px] border border-stone-200 bg-white/85 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/85">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Replies</h2>
            <div className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
              {replies.length} {replies.length === 1 ? "answer" : "answers"}
            </div>
          </div>

          <div className="space-y-5">
            {replies.length === 0 ? (
              <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center dark:border-stone-700 dark:bg-stone-950/60">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-200 text-2xl text-stone-600 dark:bg-stone-800 dark:text-stone-200">✎</div>
                <h3 className="mt-4 text-xl font-semibold text-stone-900 dark:text-stone-50">No replies yet</h3>
                <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                  This question is waiting for a mathematically grounded reply from the community.
                </p>
              </div>
            ) : (
              replies.map((reply) => (
                <div key={reply.id} className="rounded-[26px] border border-stone-200 bg-stone-50/80 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.03)] dark:border-stone-800 dark:bg-stone-950/50">
                  <div className="grid gap-4 xl:grid-cols-[80px_minmax(0,1fr)]">
                    <div className="flex flex-col items-center gap-2 rounded-[20px] border border-stone-200 bg-white px-2 py-3 dark:border-stone-800 dark:bg-stone-900">
                      <button type="button" className="text-xl text-stone-400 transition hover:text-stone-700 dark:hover:text-stone-100">▲</button>
                      <div className="text-xl font-semibold text-stone-900 dark:text-stone-50">{Math.max(replies.length, 1)}</div>
                      <button type="button" className="text-xl text-stone-400 transition hover:text-stone-700 dark:hover:text-stone-100">▼</button>
                    </div>

                    <div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-stone-700 to-stone-400 text-[10px] font-semibold uppercase text-white dark:from-stone-100 dark:to-stone-500 dark:text-stone-950">
                            {getInitials(reply.authorName || "Member")}
                          </div>
                          <div>
                            <div className="font-medium text-stone-900 dark:text-stone-100">{reply.authorName}</div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400">Research member</div>
                          </div>
                        </div>
                        <div className="text-xs text-stone-500 dark:text-stone-400">
                          {new Date(reply.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </div>
                      </div>

                      {editingReplyId === reply.id ? (
                        <div className="mt-4 space-y-3">
                          <textarea
                            value={replyDrafts[reply.id] ?? reply.content}
                            onChange={(event) => setReplyDrafts((current) => ({ ...current, [reply.id]: event.target.value }))}
                            className="min-h-[140px] w-full rounded-[20px] border border-stone-300 bg-white px-3 py-3 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                            required
                          />
                          <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={() => handleReplyUpdate(reply.id)} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900">
                              Save
                            </button>
                            <button type="button" onClick={() => { setEditingReplyId(null); setReplyDrafts((current) => ({ ...current, [reply.id]: "" })); }} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:text-stone-200">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-[22px] border border-stone-200 bg-white p-4 text-stone-700 shadow-inner dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                          <MathRenderer content={reply.content} />
                        </div>
                      )}

                      {canEditReply(reply) ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" onClick={() => { setEditingReplyId(reply.id); setReplyDrafts((current) => ({ ...current, [reply.id]: reply.content })); }} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:text-stone-200">
                            Edit answer
                          </button>
                          <button type="button" onClick={() => handleReplyDelete(reply.id)} className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-400 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
                            Delete
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="mt-8 rounded-[28px] border border-stone-200 bg-white/85 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/85">
          <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-50">Your answer</h2>

          {!isAuthenticated ? (
            <div className="mt-5 rounded-[24px] border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
              <p className="text-sm leading-6 text-stone-700 dark:text-stone-300">
                You need a verified account to contribute. Create an account or log in to join the discussion.
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
                Your reasoning
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="mt-2 min-h-36 w-full rounded-[22px] border border-stone-300 bg-stone-50 px-3 py-3 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-950"
                  placeholder="Share a proof sketch, a theorem, a counterexample, or a method..."
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
    </div>
  );
}
