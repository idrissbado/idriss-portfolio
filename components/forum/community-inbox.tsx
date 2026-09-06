"use client";

import { useEffect, useState } from "react";
import { Mail, Plus, Send, X } from "lucide-react";

type InboxMessage = { id: string; subject: string; content: string; createdAt: string; readAt: string | null; sender: { nickname: string } };

export function CommunityInbox({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [recipientNickname, setRecipientNickname] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showComposer, setShowComposer] = useState(false);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetch("/api/messages").then(async (response) => {
      if (response.ok) setMessages(((await response.json()) as { messages: InboxMessage[] }).messages);
    });
  }, [isAuthenticated]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    const response = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientNickname, subject, content }),
    });
    const payload = (await response.json()) as { error?: string };
    setStatusMessage(response.ok ? "Message sent." : payload.error ?? "Message could not be sent.");
    if (response.ok) {
      setRecipientNickname(""); setSubject(""); setContent(""); setShowComposer(false);
    }
    setIsSending(false);
  };

  if (!isAuthenticated) return null;

  return (
    <section className="mt-6 overflow-hidden rounded-[24px] border border-stone-200/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.07)] dark:border-stone-800 dark:bg-stone-900">
      <div className="border-b border-stone-200/80 bg-[linear-gradient(135deg,#172033,#29404c)] p-4 text-white dark:border-stone-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15"><Mail className="h-4 w-4" /></div>
            <div><div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-300">Private inbox</div><h2 className="mt-1 text-xl font-semibold tracking-tight">Messages</h2></div>
          </div>
          <button type="button" onClick={() => setShowComposer((value) => !value)} aria-label={showComposer ? "Close message composer" : "Write a new message"} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-stone-900 transition hover:bg-slate-200">{showComposer ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}</button>
        </div>
        <p className="mt-4 text-xs leading-5 text-slate-300">Contact another member privately without exposing email addresses.</p>
      </div>

      {showComposer ? <form onSubmit={sendMessage} className="border-b border-stone-200 bg-stone-50/80 p-4 dark:border-stone-800 dark:bg-stone-950/50">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500">New conversation</div>
        <div className="space-y-3">
          <input value={recipientNickname} onChange={(event) => setRecipientNickname(event.target.value)} placeholder="Recipient nickname" aria-label="Recipient nickname" className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-900" required />
          <input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" aria-label="Subject" className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-900" required />
          <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a private message" aria-label="Private message" className="min-h-28 w-full resize-y rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100 dark:border-stone-700 dark:bg-stone-900" required />
          <button type="submit" disabled={isSending} className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"><Send className="h-3.5 w-3.5" />{isSending ? "Sending..." : "Send message"}</button>
        </div>
      </form> : null}
      {statusMessage ? <p className="border-b border-stone-200 px-4 py-3 text-xs font-medium text-teal-700 dark:border-stone-800 dark:text-teal-300">{statusMessage}</p> : null}
      <div className="space-y-2 p-4">{messages.length === 0 ? <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-center dark:border-stone-700 dark:bg-stone-950/50"><Mail className="mx-auto h-5 w-5 text-stone-400" /><p className="mt-2 text-sm font-medium text-stone-700 dark:text-stone-300">Your inbox is quiet</p><p className="mt-1 text-xs leading-5 text-stone-500">Private conversations will appear here.</p></div> : messages.slice(0, 5).map((message) => <article key={message.id} className={`rounded-2xl border p-3 transition ${message.readAt ? "border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900" : "border-teal-200 bg-teal-50/70 shadow-sm dark:border-teal-900 dark:bg-teal-950/30"}`}><div className="flex items-center justify-between gap-2 text-xs"><strong className="text-stone-900 dark:text-stone-100">@{message.sender.nickname}</strong><span className="text-stone-500">{new Date(message.createdAt).toLocaleDateString()}</span></div><div className="mt-2 text-sm font-semibold text-stone-800 dark:text-stone-200">{message.subject}</div><p className="mt-1 line-clamp-2 text-xs leading-5 text-stone-600 dark:text-stone-400">{message.content}</p></article>)}</div>
    </section>
  );
}
