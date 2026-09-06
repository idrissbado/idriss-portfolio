"use client";

import { useEffect, useState } from "react";

type InboxMessage = { id: string; subject: string; content: string; createdAt: string; readAt: string | null; sender: { nickname: string } };

export function CommunityInbox({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [recipientNickname, setRecipientNickname] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [showComposer, setShowComposer] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void fetch("/api/messages").then(async (response) => {
      if (response.ok) setMessages(((await response.json()) as { messages: InboxMessage[] }).messages);
    });
  }, [isAuthenticated]);

  const sendMessage = async (event: React.FormEvent) => {
    event.preventDefault();
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
  };

  if (!isAuthenticated) return null;

  return (
    <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center justify-between gap-3">
        <div><div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500">Private inbox</div><h2 className="mt-1 text-lg font-semibold text-stone-900 dark:text-stone-50">Messages</h2></div>
        <button type="button" onClick={() => setShowComposer((value) => !value)} className="rounded-full bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-stone-100 dark:text-stone-900">New message</button>
      </div>
      {showComposer ? <form onSubmit={sendMessage} className="mt-4 space-y-2"><input value={recipientNickname} onChange={(event) => setRecipientNickname(event.target.value)} placeholder="Recipient nickname" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950" required /><input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject" className="w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950" required /><textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write a private message" className="min-h-24 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950" required /><button type="submit" className="rounded-full bg-teal-700 px-3 py-2 text-xs font-semibold text-white">Send</button></form> : null}
      {statusMessage ? <p className="mt-3 text-xs text-teal-700">{statusMessage}</p> : null}
      <div className="mt-4 space-y-2">{messages.length === 0 ? <p className="text-sm text-stone-500">No private messages yet.</p> : messages.slice(0, 5).map((message) => <article key={message.id} className={`rounded-xl border p-3 ${message.readAt ? "border-stone-200" : "border-teal-300 bg-teal-50/60"}`}><div className="flex justify-between gap-2 text-xs"><strong>@{message.sender.nickname}</strong><span>{new Date(message.createdAt).toLocaleDateString()}</span></div><div className="mt-1 text-sm font-semibold">{message.subject}</div><p className="mt-1 line-clamp-2 text-xs text-stone-600">{message.content}</p></article>)}</div>
    </section>
  );
}
