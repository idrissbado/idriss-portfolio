"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { ForumAccountControl } from "@/components/forum/forum-account-control";
import { MathComposer } from "@/components/math/math-composer";
import { MathRenderer } from "@/components/math/math-renderer";
import type { ForumReplyRecord, ForumTopic } from "@/lib/community-store";
import { getPrivateFallbackNickname } from "@/lib/nickname";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "M";
}

export function ForumThreadPageClient({ topic }: { topic: ForumTopic }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [question, setQuestion] = useState<ForumTopic>(topic);
  const [replies, setReplies] = useState<ForumReplyRecord[]>(topic.replies);
  const [draft, setDraft] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [questionDraft, setQuestionDraft] = useState({
    title: topic.title,
    content: topic.content,
    category: topic.category,
    imageUrl: topic.imageUrl ?? "",
    imageAltText: topic.imageAltText ?? "",
  });
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<{ type: "idle" | "success" | "error"; message: string }>({
    type: "idle",
    message: "",
  });

  const isAuthenticated = status === "authenticated";
  const isModerator = ["admin", "editor"].includes(session?.user?.role?.toLowerCase() ?? "");
  const publicNickname = session?.user?.nickname || (session?.user?.id ? getPrivateFallbackNickname(session.user.id) : "");
  const ownsQuestion = Boolean(
    (publicNickname && question.authorName && publicNickname === question.authorName.trim().toLowerCase()) ||
    (session?.user?.name && question.authorName && session.user.name.trim().toLowerCase() === question.authorName.trim().toLowerCase()),
  );
  const canEditQuestion = isAuthenticated && (isModerator || ownsQuestion);
  const canEditReply = (reply: ForumReplyRecord) => {
    if (!isAuthenticated) {
      return false;
    }

    if (isModerator) {
      return true;
    }

    return Boolean(
      (publicNickname && reply.authorName && publicNickname === reply.authorName.trim().toLowerCase()) ||
      (session?.user?.name && reply.authorName && session.user.name.trim().toLowerCase() === reply.authorName.trim().toLowerCase()),
    );
  };
  const votes = Math.max(replies.length + 1, 1);

  const handleNicknameClaimed = (previousNickname: string, nickname: string) => {
    const previous = previousNickname.trim().toLowerCase();
    const replaceNickname = (authorName: string) =>
      authorName.trim().toLowerCase() === previous ? nickname : authorName;

    setQuestion((currentQuestion) => ({
      ...currentQuestion,
      authorName: replaceNickname(currentQuestion.authorName),
      replies: currentQuestion.replies.map((reply) => ({
        ...reply,
        authorName: replaceNickname(reply.authorName),
      })),
    }));
    setReplies((currentReplies) =>
      currentReplies.map((reply) => ({
        ...reply,
        authorName: replaceNickname(reply.authorName),
      })),
    );
    setStatusMessage({
      type: "success",
      message: `Your public nickname is now @${nickname}. Your existing posts have been updated.`,
    });
  };

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
          imageUrl: questionDraft.imageUrl || undefined,
          imageAltText: questionDraft.imageAltText || undefined,
        }),
      });

      const payload = (await response.json()) as { topic?: ForumTopic; error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update the question.");
      }

      if (payload.topic) {
        setQuestion(payload.topic);
        setQuestionDraft({
          title: payload.topic.title,
          content: payload.topic.content,
          category: payload.topic.category,
          imageUrl: payload.topic.imageUrl ?? "",
          imageAltText: payload.topic.imageAltText ?? "",
        });
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
      });

      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to delete the question.");
      }

      setStatusMessage({ type: "success", message: "The question was deleted." });
      router.push("/forum");
      router.refresh();
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
          <ForumAccountControl tone="light" onNicknameClaimed={handleNicknameClaimed} />
        </div>

        {statusMessage.message ? (
          <p
            aria-live="polite"
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
              statusMessage.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
                : "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
            }`}
          >
            {statusMessage.message}
          </p>
        ) : null}

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
                  <div className="rounded-[18px] border border-stone-300 bg-stone-50 p-3 dark:border-stone-700 dark:bg-stone-950">
                    <label className="block text-xs font-semibold uppercase tracking-[0.12em] text-stone-500 dark:text-stone-400">Image URL</label>
                    <input
                      value={questionDraft.imageUrl}
                      onChange={(event) => setQuestionDraft((current) => ({ ...current, imageUrl: event.target.value }))}
                      placeholder="Paste a public image URL"
                      className="mt-2 w-full rounded-2xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-stone-500 dark:border-stone-700 dark:bg-stone-900"
                    />
                    {questionDraft.imageUrl ? (
                      <div className="mt-3 overflow-hidden rounded-[14px] border border-stone-200 bg-white dark:border-stone-800">
                        <img src={questionDraft.imageUrl} alt={questionDraft.imageAltText || "Question image preview"} className="max-h-[220px] w-full object-cover" />
                      </div>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button type="submit" disabled={submitting} className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-900">
                      {submitting ? "Saving..." : "Save changes"}
                    </button>
                    <button type="button" onClick={() => { setIsEditingQuestion(false); setQuestionDraft({
                      title: question.title,
                      content: question.content,
                      category: question.category,
                      imageUrl: question.imageUrl ?? "",
                      imageAltText: question.imageAltText ?? "",
                    }); }} className="rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:text-stone-200">
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <h1 className="mt-4 text-3xl font-semibold tracking-tight text-stone-950 dark:text-stone-50 sm:text-4xl">
                    <MathRenderer content={question.title} variant="title" />
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
              {question.imageUrl ? (
                <div className="mb-5 overflow-hidden rounded-[20px] border border-stone-200 bg-white dark:border-stone-800">
                  <img src={question.imageUrl} alt={question.imageAltText || "Attached forum image"} className="max-h-[420px] w-full object-cover" />
                </div>
              ) : null}
              <MathRenderer content={question.content} />
            </div>
          </div>
        </article>

        <section id="answer-composer" className="mt-8 scroll-mt-24 rounded-[28px] border border-stone-200 bg-white/85 p-6 shadow-[0_18px_35px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/85">
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
                          <label htmlFor={`reply-editor-${reply.id}`} className="block text-sm font-semibold text-stone-700 dark:text-stone-200">
                            Edit answer
                          </label>
                          <MathComposer
                            id={`reply-editor-${reply.id}`}
                            value={replyDrafts[reply.id] ?? reply.content}
                            onChange={(value) => setReplyDrafts((current) => ({ ...current, [reply.id]: value }))}
                            disabled={submitting}
                            minHeightClassName="min-h-44"
                            placeholder="Refine your reasoning. Markdown and LaTeX are supported."
                          />
                          <div className="flex flex-wrap gap-3">
                            <button type="button" onClick={() => handleReplyUpdate(reply.id)} disabled={submitting || !(replyDrafts[reply.id] ?? reply.content).trim()} className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-stone-100 dark:text-stone-900">
                              {submitting ? "Saving..." : "Save answer"}
                            </button>
                            <button type="button" disabled={submitting} onClick={() => { setEditingReplyId(null); setReplyDrafts((current) => ({ ...current, [reply.id]: "" })); }} className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:text-stone-200">
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-4 rounded-[22px] border border-stone-200 bg-white p-4 text-stone-700 shadow-inner dark:border-stone-800 dark:bg-stone-900 dark:text-stone-300">
                          {reply.imageUrl ? (
                            <div className="mb-4 overflow-hidden rounded-[18px] border border-stone-200 bg-stone-50 dark:border-stone-800 dark:bg-stone-950">
                              <img src={reply.imageUrl} alt={reply.imageAltText || "Attached forum image"} className="max-h-[320px] w-full object-cover" />
                            </div>
                          ) : null}
                          <MathRenderer content={reply.content} />
                        </div>
                      )}

                      {canEditReply(reply) && editingReplyId !== reply.id ? (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button type="button" disabled={submitting} onClick={() => { setEditingReplyId(reply.id); setReplyDrafts((current) => ({ ...current, [reply.id]: reply.content })); setStatusMessage({ type: "idle", message: "" }); }} className="rounded-full border border-stone-300 px-3 py-1.5 text-xs font-medium text-stone-700 hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-60 dark:border-stone-700 dark:text-stone-200">
                            Edit answer
                          </button>
                          <button type="button" disabled={submitting} onClick={() => handleReplyDelete(reply.id)} className="rounded-full border border-rose-300 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 hover:border-rose-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
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
              <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-300">
                Posting publicly as <span className="font-semibold text-stone-900 dark:text-stone-100">@{publicNickname}</span>
              </div>

              <label htmlFor="new-answer-content" className="block text-sm font-medium text-stone-700 dark:text-stone-300">
                Your reasoning
              </label>
              <MathComposer
                id="new-answer-content"
                value={draft}
                onChange={setDraft}
                disabled={submitting}
                minHeightClassName="min-h-48"
                placeholder="Share a proof sketch, a theorem, a counterexample, or a method..."
              />

              <button
                type="submit"
                disabled={submitting || draft.trim().length < 2}
                className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-900"
              >
                {submitting ? "Posting..." : "Post answer"}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
