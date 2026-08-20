"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { MathRenderer } from "@/components/math/math-renderer";
import type { CommunityStats, ForumTopic } from "@/lib/community-store";

const defaultForm = {
  title: "",
  authorName: "",
  authorEmail: "",
  category: "General",
  tags: "",
  content: "",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "M";
}

export function ForumPageClient({
  initialTopics,
  initialStats,
}: {
  initialTopics: ForumTopic[];
  initialStats?: CommunityStats;
}) {
  const { data: session, status } = useSession();
  const [topics, setTopics] = useState(initialTopics);
  const [form, setForm] = useState(defaultForm);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("interesting");
  const [activeNav, setActiveNav] = useState<"home" | "questions" | "unanswered" | "ai-assist" | "tags" | "users">("questions");
  const [selectedTag, setSelectedTag] = useState("all");
  const [showComposer, setShowComposer] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
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
  const navItems = [
    { key: "home", label: "Home", icon: "⌂" },
    { key: "questions", label: "Questions", icon: "⌁" },
    { key: "unanswered", label: "Unanswered", icon: "◌" },
    { key: "ai-assist", label: "AI Assist", icon: "✦" },
    { key: "tags", label: "Tags", icon: "⚑" },
    { key: "users", label: "Users", icon: "◍" },
  ] as const;
  const tabOptions = ["interesting", "bountied", "hot", "week", "month"] as const;
  const tagChips = ["all", "real-analysis", "calculus", "linear-algebra", "probability", "geometry", "optimization"];
  const hotQuestions = topics.slice(0, 5).map((topic) => topic.title);
  const featuredMembers = initialStats?.featuredMembers ?? [];
  const questionCount = Math.max(initialStats?.questionCount ?? topics.length, 0);
  const answerCount = Math.max(initialStats?.answerCount ?? topics.reduce((total, topic) => total + topic.replies.length, 0), 0);
  const memberCount = Math.max(initialStats?.memberCount ?? 0, 0);
  const forumStats = [
    { label: "Members", value: memberCount > 0 ? String(memberCount) : "Community" },
    { label: "Questions", value: String(questionCount) },
    { label: "Answers", value: String(answerCount) },
  ];

  const filteredTopics = [...topics]
    .filter((topic) => {
      const haystack = `${topic.title} ${topic.content} ${topic.category} ${topic.authorName}`.toLowerCase();
      const searchMatches = haystack.includes(search.toLowerCase());
      const tagMatches = selectedTag === "all" || [topic.category, topic.title, topic.content].some((value) => value.toLowerCase().includes(selectedTag.toLowerCase()));
      const navMatches =
        activeNav === "home" || activeNav === "questions"
          ? true
          : activeNav === "unanswered"
            ? topic.replies.length === 0
            : activeNav === "tags"
              ? true
              : activeNav === "users"
                ? true
                : activeNav === "ai-assist"
                  ? true
                  : true;
      return searchMatches && tagMatches && navMatches;
    })
    .sort((a, b) => {
      const scoreA = a.replies.length + (a.title.length > 40 ? 4 : 0);
      const scoreB = b.replies.length + (b.title.length > 40 ? 4 : 0);
      if (activeTab === "hot") return scoreB - scoreA;
      if (activeTab === "bountied") return scoreB - scoreA;
      if (activeTab === "week") return scoreB - scoreA;
      if (activeTab === "month") return scoreB - scoreA;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const normalizeTags = (raw: string) =>
    Array.from(
      new Set(
        raw
          .split(/[\s,]+/)
          .map((tag) => tag.trim().replace(/^#+|[()\[\]{}]/g, "").toLowerCase())
          .filter(Boolean)
          .slice(0, 5),
      ),
    );

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
      const normalizedTags = normalizeTags(form.tags);
      const primaryCategory = normalizedTags[0] || form.category || "General";

      const response = await fetch("/api/forum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          category: primaryCategory,
          tags: normalizedTags,
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
      setShowComposer(false);
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

  const askedLabel = isAuthenticated ? "Ask question" : "Create account";
  const emptyStateTitle =
    activeNav === "unanswered"
      ? "No unanswered questions yet"
      : activeNav === "tags"
        ? "No matching tags yet"
        : activeNav === "users"
          ? "No community members yet"
          : activeNav === "ai-assist"
            ? "AI assistance is ready"
            : "No questions yet";
  const emptyStateCopy =
    activeNav === "unanswered"
      ? "This forum has no open questions right now. Start the next important discussion and invite the community to answer it."
      : activeNav === "tags"
        ? "Choose a tag from the list above to narrow the forum to a specific research area."
        : activeNav === "users"
          ? "Member profiles will appear here once the community grows with verified researchers and students."
          : activeNav === "ai-assist"
            ? "The forum is ready for AI-guided research support, but it still needs real community questions to assist with."
            : "Be the first member to start a rigorous discussion. Ask a question, share a proof, or request a reference from the community.";

  const insertSnippet = (before: string, after = "", placeholder = "") => {
    const textarea = textareaRef.current;
    if (!textarea) {
      setForm((current) => ({ ...current, content: `${current.content}${before}${placeholder}${after}` }));
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    setForm((current) => {
      const value = current.content;
      const selected = value.slice(start, end) || placeholder;
      const nextValue = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
      return { ...current, content: nextValue };
    });

    requestAnimationFrame(() => {
      textarea.focus();
      const nextStart = start + before.length;
      const nextEnd = nextStart + (form.content.slice(start, end) || placeholder).length;
      textarea.setSelectionRange(nextStart, nextEnd);
    });
  };

  const openComposer = () => {
    if (!isAuthenticated) {
      return;
    }

    setShowComposer(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="forum-shell min-h-screen bg-[#f5f1ec]">
      <div className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="premium-surface mb-6 rounded-[28px] border border-stone-200/90 bg-white/80 p-4 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-stone-800 to-stone-500 text-lg font-semibold text-white shadow-sm dark:from-stone-200 dark:to-stone-500 dark:text-stone-950">
                ∑
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em] text-stone-500 dark:text-stone-400">Research forum</div>
                <div className="text-xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">Mathematics</div>
              </div>
            </div>

            <div className="flex flex-1 items-center justify-end gap-3">
              <label className="hidden w-full max-w-xl items-center gap-3 rounded-full border border-stone-200 bg-stone-100 px-4 py-2.5 text-sm text-stone-500 md:flex dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-400">
                <span className="text-base">⌕</span>
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  className="w-full border-0 bg-transparent text-sm text-stone-700 outline-none placeholder:text-stone-500 dark:text-stone-200 dark:placeholder:text-stone-500"
                  placeholder="Search on Mathematics..."
                  aria-label="Search forum questions"
                />
              </label>

              {!isAuthenticated ? (
                <div className="flex items-center gap-2">
                  <Link href="/login" className="rounded-full border border-stone-300 bg-white px-4 py-2.5 text-sm font-medium text-stone-700 transition hover:border-stone-500 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200">
                    Log in
                  </Link>
                  <Link href="/register" className="rounded-full bg-stone-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900">
                    Sign up
                  </Link>
                </div>
              ) : (
                <div className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                  Member access
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid gap-6 xl:grid-cols-[240px_minmax(0,1fr)_310px]">
          <aside className="forum-panel-glow rounded-[26px] border border-stone-200 bg-white/80 p-4 shadow-[0_18px_35px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-900/80">
            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveNav(item.key)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium transition ${
                    activeNav === item.key
                      ? "bg-stone-100 text-stone-900 shadow-inner dark:bg-stone-800 dark:text-stone-50"
                      : "text-stone-600 hover:bg-stone-50 hover:text-stone-950 dark:text-stone-300 dark:hover:bg-stone-800 dark:hover:text-white"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="mt-6 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Stack internal</div>
              <p className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                A premium research and teaching forum for deep mathematical discussion, rigorous proofs, and collaborative learning.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {tagChips.filter((tag) => tag !== "all").slice(0, 4).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition ${
                      selectedTag === tag
                        ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                        : "border-stone-300 bg-white text-stone-600 hover:border-stone-500 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              {!isAuthenticated ? (
                <div className="mt-4 flex flex-col gap-2">
                  <Link href="/register" className="rounded-full bg-stone-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900">
                    Create account
                  </Link>
                  <Link href="/login" className="rounded-full border border-stone-300 px-3 py-2 text-center text-sm font-medium text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:text-stone-200">
                    Log in
                  </Link>
                </div>
              ) : null}
            </div>
          </aside>

          <main className="space-y-5">
            <section className="premium-surface forum-panel-glow rounded-[28px] border border-stone-200 bg-white/80 p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)] backdrop-blur-sm dark:border-stone-800 dark:bg-stone-900/80">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Explore questions</p>
                  <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 dark:text-stone-50 sm:text-4xl">Ask better questions. Get sharper answers.</h1>
                </div>

                {!isAuthenticated ? (
                  <Link href="/register" className="inline-flex items-center justify-center rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900">
                    {askedLabel}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={openComposer}
                    className="inline-flex items-center justify-center rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900"
                  >
                    {askedLabel}
                  </button>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                {tagChips.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSelectedTag(tag);
                      setActiveNav("tags");
                    }}
                    className={`rounded-full border px-2.5 py-1 text-[11px] font-medium capitalize transition ${
                      selectedTag === tag
                        ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                        : "border-stone-200 bg-stone-50 text-stone-700 hover:border-stone-300 hover:text-stone-950 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-200 dark:hover:border-stone-500"
                    }`}
                  >
                    {tag === "all" ? "all topics" : tag}
                  </button>
                ))}
              </div>

              {activeNav === "tags" && (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Tag explorer</div>
                  <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    {selectedTag === "all" ? "Showing every topic across the forum." : `Filtering by ${selectedTag}.`}
                  </p>
                </div>
              )}

              {activeNav === "users" && (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Member directory</div>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {featuredMembers.length > 0 ? (
                      featuredMembers.map((member) => (
                        <div key={member.name} className="rounded-2xl border border-stone-200 bg-white p-3 dark:border-stone-700 dark:bg-stone-900">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-500 text-[10px] font-semibold uppercase text-white dark:from-stone-100 dark:to-stone-400 dark:text-stone-950">
                              {getInitials(member.name)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-stone-900 dark:text-stone-50">{member.name}</div>
                              <div className="text-[11px] text-stone-500 dark:text-stone-400">{member.role}</div>
                            </div>
                          </div>
                          <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600 dark:text-stone-300">{member.badge}</div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-4 text-sm leading-6 text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                        Community members will appear here after the first verified sign-ups.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeNav === "ai-assist" && (
                <div className="mt-4 rounded-2xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950/60">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">AI research support</div>
                  <p className="mt-2 text-sm leading-6 text-stone-600 dark:text-stone-300">
                    The forum is ready for AI-assisted discovery, but it still needs real questions and answers to help the community learn.
                  </p>
                </div>
              )}

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {forumStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-stone-200 bg-stone-50/80 p-3 text-center dark:border-stone-800 dark:bg-stone-950/60">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">{stat.label}</div>
                    <div className="mt-2 text-xl font-semibold text-stone-900 dark:text-stone-50">{stat.value}</div>
                  </div>
                ))}
              </div>
            </section>

            {isAuthenticated && showComposer ? (
              <section id="question-composer" className="rounded-[8px] border border-[#d6d9dc] bg-[#f8f9f9] p-4 shadow-none dark:border-stone-800 dark:bg-stone-900/90">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex items-center justify-end">
                    <span className="text-sm font-medium text-stone-500 dark:text-stone-400">
                      Required fields<span className="ml-1 text-red-500">*</span>
                    </span>
                  </div>

                  <div>
                    <label className="block text-[18px] font-semibold text-stone-800 dark:text-stone-100">
                      Title<span className="ml-1 text-red-500">*</span>
                    </label>
                    <p className="mt-2 text-[15px] leading-6 text-stone-600 dark:text-stone-300">
                      Be specific and imagine you&apos;re asking another person
                    </p>
                    <input
                      value={form.title}
                      onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
                      className="mt-3 w-full rounded-[6px] border border-[#babfc4] bg-white px-3 py-2.5 text-base text-stone-900 outline-none transition focus:border-[#6bbbf7] focus:ring-2 focus:ring-[#d0ebff] dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                      placeholder="What&apos;s your math question? Be specific."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[18px] font-semibold text-stone-800 dark:text-stone-100">
                      Body<span className="ml-1 text-red-500">*</span>
                    </label>
                    <p className="mt-2 text-[15px] leading-6 text-stone-600 dark:text-stone-300">
                      Include all the information someone would need to answer your question
                    </p>

                    <div className="mt-3 overflow-hidden rounded-[6px] border border-[#d6d9dc] bg-white shadow-sm dark:border-stone-700 dark:bg-stone-950">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e3e6e8] bg-[#f1f2f3] px-3 py-2 dark:border-stone-700 dark:bg-stone-900/80">
                        <div className="flex flex-wrap items-center gap-2 text-base text-stone-700 dark:text-stone-200">
                          {[
                            { label: "B", action: () => insertSnippet("**", "**", "bold text") },
                            { label: "I", action: () => insertSnippet("*", "*", "italic text") },
                            { label: "🔗", action: () => insertSnippet("[", "](") },
                            { label: "📷", action: () => insertSnippet("![", "]()", "image alt text") },
                            { label: "•", action: () => insertSnippet("\n- ", "", "list item") },
                            { label: "❝", action: () => insertSnippet("\n> ", "", "quoted text") },
                            { label: "</>", action: () => insertSnippet("\n```\n", "\n```", "code") },
                            { label: "$", action: () => insertSnippet("$", "$", "x^2") },
                            { label: "↶", action: () => insertSnippet("", "", "") },
                          ].map((tool, index) => (
                            <button
                              key={`${tool.label}-${index}`}
                              type="button"
                              onClick={tool.action}
                              className="flex h-8 w-8 items-center justify-center rounded-[4px] border border-[#d6d9dc] bg-white text-sm font-semibold text-stone-700 transition hover:border-stone-500 hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
                              aria-label={tool.label === "B" ? "Bold" : tool.label === "I" ? "Italic" : "Formatting tool"}
                            >
                              {tool.label}
                            </button>
                          ))}
                        </div>

                        <button
                          type="button"
                          className="rounded-[4px] bg-[#e3e6e8] px-3 py-1.5 text-sm font-medium text-stone-700 transition hover:bg-[#d6d9dc] dark:bg-stone-800 dark:text-stone-200 dark:hover:bg-stone-700"
                        >
                          Hide formatting tips
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-3 border-b border-[#e3e6e8] px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:text-stone-300">
                        {['Links', 'Images', 'Styling/Headers', 'Lists', 'Blockquotes', 'Preformatted', 'HTML', 'Tables', 'More'].map((label) => (
                          <button key={label} type="button" className="hover:text-stone-950 dark:hover:text-stone-100">
                            {label}
                          </button>
                        ))}
                      </div>

                      <textarea
                        ref={textareaRef}
                        value={form.content}
                        onChange={(event) => setForm((current) => ({ ...current, content: event.target.value }))}
                        className="min-h-[220px] w-full resize-y border-0 bg-transparent px-4 py-4 text-base text-stone-900 outline-none placeholder:text-stone-500 dark:text-stone-50"
                        placeholder="Write your full question here. You can use LaTeX such as $\frac{a}{b}$ or $$\sum_{n=1}^{\infty} \frac{1}{n^2}$$."
                        required
                      />
                    </div>

                    <div className="mt-3 rounded-[6px] border border-[#e3e6e8] bg-[#f1f2f3] px-3 py-2 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                      <span className="mr-2 font-medium">code</span>
                      <span className="font-mono text-stone-700 dark:text-stone-200">**bold**</span>
                      <span className="mx-2"> </span>
                      <span className="font-mono text-stone-700 dark:text-stone-200">*italic*</span>
                      <span className="mx-2"> </span>
                      <span className="font-mono text-stone-700 dark:text-stone-200">&gt;quote</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[18px] font-semibold text-stone-800 dark:text-stone-100">
                      Tags<span className="ml-1 text-red-500">*</span>
                    </label>
                    <p className="mt-2 text-[15px] leading-6 text-stone-600 dark:text-stone-300">
                      Add up to 5 tags to describe what your question is about
                    </p>
                    <div className="relative mt-3">
                      <input
                        value={form.tags}
                        onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))}
                        className="w-full rounded-[6px] border border-[#babfc4] bg-white px-3 py-2.5 text-base text-stone-900 outline-none transition focus:border-[#6bbbf7] focus:ring-2 focus:ring-[#d0ebff] dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
                        placeholder="e.g. (inequality measure-theory number-theory)"
                      />
                      <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-[#e3e6e8] px-2 py-1 text-sm font-semibold text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                        ?
                      </button>
                    </div>
                  </div>

                  {statusMessage.message ? (
                    <p
                      aria-live="polite"
                      className={`text-sm ${statusMessage.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                    >
                      {statusMessage.message}
                    </p>
                  ) : null}

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <p className="text-xs leading-5 text-stone-500 dark:text-stone-400">
                      LaTeX is supported: wrap inline math with $...$ and display math with $$...$$.
                    </p>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setForm(defaultForm);
                          setStatusMessage({ type: "idle", message: "" });
                        }}
                        className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:border-stone-400 dark:border-stone-700 dark:text-stone-200"
                      >
                        Clear
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="rounded-[5px] bg-[#0c0d0e] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#2f3337] disabled:cursor-not-allowed disabled:opacity-70 dark:bg-stone-100 dark:text-stone-900"
                      >
                        {submitting ? "Publishing..." : "Post your question"}
                      </button>
                    </div>
                  </div>
                </form>
              </section>
            ) : null}

            <section className="rounded-[28px] border border-stone-200 bg-white/80 p-4 shadow-[0_18px_35px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-900/80">
              <div className="mb-4 flex flex-wrap items-center gap-2">
                {tabOptions.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition ${
                      activeTab === tab
                        ? "border-stone-900 bg-stone-900 text-white dark:border-stone-100 dark:bg-stone-100 dark:text-stone-900"
                        : "border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:text-stone-900 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-300 dark:hover:border-stone-500 dark:hover:text-white"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {filteredTopics.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50/80 p-8 text-center dark:border-stone-700 dark:bg-stone-950/60">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-stone-200 text-3xl text-stone-700 dark:bg-stone-800 dark:text-stone-200">✦</div>
                  <h2 className="mt-5 text-2xl font-semibold text-stone-900 dark:text-stone-50">{emptyStateTitle}</h2>
                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600 dark:text-stone-300">
                    {emptyStateCopy}
                  </p>
                  {!isAuthenticated ? (
                    <div className="mt-5 flex flex-wrap justify-center gap-3">
                      <Link href="/register" className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900">
                        Create account
                      </Link>
                      <Link href="/login" className="rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-stone-400 dark:border-stone-700 dark:text-stone-200">
                        Log in
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-5 flex justify-center">
                      <button
                        type="button"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="rounded-full bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700 dark:bg-stone-100 dark:text-stone-900"
                      >
                        Publish a question
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTopics.map((topic) => (
                    <article key={topic.id} className="forum-panel-glow rounded-[24px] border border-stone-200 bg-[#fffdfb] p-4 shadow-[0_12px_30px_rgba(15,23,42,0.03)] transition hover:border-stone-300 hover:shadow-[0_18px_35px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-950/40">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-stone-200 bg-stone-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-700 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-200">
                              {topic.category}
                            </span>
                            <span className="text-[11px] text-stone-500 dark:text-stone-400">
                              {topic.replies.length} {topic.replies.length === 1 ? "reply" : "replies"}
                            </span>
                          </div>

                          <Link href={`/forum/${topic.slug}`} className="mt-3 block text-xl font-semibold leading-snug text-stone-900 transition hover:text-stone-700 dark:text-stone-50 dark:hover:text-stone-200 sm:text-[1.55rem]">
                            {topic.title}
                          </Link>

                          <div className="mt-3 text-sm leading-6 text-stone-600 dark:text-stone-300">
                            <MathRenderer content={topic.excerpt ?? `${topic.content.slice(0, 180)}${topic.content.length > 180 ? "..." : ""}`} />
                          </div>
                        </div>

                        <div className="flex min-w-[86px] flex-col items-center justify-center rounded-2xl border border-stone-200 bg-stone-50 px-3 py-2 text-center shadow-inner dark:border-stone-700 dark:bg-stone-900">
                          <div className="text-[11px] uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">votes</div>
                          <div className="mt-1 text-2xl font-semibold text-stone-900 dark:text-stone-50">{Math.max(topic.replies.length, 1)}</div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-3 border-t border-stone-200 pt-3 sm:flex-row sm:items-center sm:justify-between dark:border-stone-800">
                        <div className="flex flex-wrap gap-2">
                          {topic.category.split(/\s+/).slice(0, 3).map((tag) => (
                            <span key={tag} className="rounded-full border border-stone-200 bg-white px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-stone-600 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300">
                              {tag.toLowerCase()}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-500 text-[10px] font-semibold uppercase text-white dark:from-stone-100 dark:to-stone-400 dark:text-stone-950">
                            {getInitials(topic.authorName || "Member")}
                          </div>
                          <div>
                            <div className="font-medium text-stone-800 dark:text-stone-100">{topic.authorName}</div>
                            <div className="text-[11px] text-stone-500 dark:text-stone-400">
                              {new Date(topic.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="hidden xl:block">
            <div className="space-y-5">
              <div className="forum-panel-glow rounded-[28px] border border-stone-200 bg-white/80 p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-900/80">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Community highlights</div>
                <div className="mt-4 space-y-3">
                  {hotQuestions.length > 0 ? (
                    hotQuestions.map((question) => (
                      <div key={question} className="flex gap-3 rounded-2xl border border-stone-200 bg-stone-50 p-3 text-sm text-stone-700 dark:border-stone-800 dark:bg-stone-950/60 dark:text-stone-200">
                        <span className="mt-1 text-base text-stone-400">◉</span>
                        <p className="leading-6">{question}</p>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
                      No highlighted discussions yet. The first published topic will appear here.
                    </div>
                  )}
                </div>
              </div>

              <div className="forum-panel-glow rounded-[28px] border border-stone-200 bg-white/80 p-5 shadow-[0_18px_35px_rgba(15,23,42,0.04)] dark:border-stone-800 dark:bg-stone-900/80">
                <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Featured members</div>
                <div className="mt-4 space-y-3">
                  {featuredMembers.length > 0 ? (
                    featuredMembers.map((member) => (
                      <div key={member.name} className="rounded-2xl border border-stone-200 bg-stone-50 p-3 dark:border-stone-800 dark:bg-stone-950/60">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-stone-800 to-stone-500 text-[10px] font-semibold uppercase text-white dark:from-stone-200 dark:to-stone-500 dark:text-stone-950">
                              {getInitials(member.name)}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-stone-900 dark:text-stone-50">{member.name}</div>
                              <div className="text-[11px] text-stone-500 dark:text-stone-400">{member.role}</div>
                            </div>
                          </div>
                          <div className="rounded-full bg-stone-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-700 dark:bg-stone-800 dark:text-stone-200">
                            {member.rep}
                          </div>
                        </div>
                        <div className="mt-3 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:border-amber-900/70 dark:bg-amber-950/30 dark:text-amber-300">
                          {member.badge}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-4 text-sm leading-6 text-stone-600 dark:border-stone-700 dark:bg-stone-950/60 dark:text-stone-300">
                      Featured member profiles will appear here once real member identities are assigned.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
