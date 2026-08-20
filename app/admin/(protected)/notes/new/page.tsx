"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LatexEditor } from "@/components/admin/latex-editor";

export default function NewNotePage() {
  const router = useRouter();
  const [title, setTitle] = useState("Goldbach Reduction Notes");
  const [subtitle, setSubtitle] = useState("A structural reduction for additive decomposition problems");
  const [authors, setAuthors] = useState("Idriss Olivier Bado");
  const [subject, setSubject] = useState("Number Theory");
  const [status, setStatus] = useState("DRAFT");
  const [abstract, setAbstract] = useState("This note develops a structural approach to additive decomposition problems and frames the analysis in a way that is useful for both theory and applied modeling.");
  const [content, setContent] = useState(`# Goldbach Reduction Notes

Let $n \ge 1$. We study the decomposition problem through a structural reduction.

$$
F(S,P)=S^5-5PS^3+5P^2S.
$$

## Main idea

This note provides a formal framework for additive identities relevant to research writing.
`);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(nextStatus: "DRAFT" | "PUBLIC") {
    setError("");
    setIsSaving(true);

    try {
      const response = await fetch("/api/admin/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          subtitle,
          authors,
          subject,
          status: nextStatus,
          abstract,
          content,
          tags: [subject],
          featured: nextStatus === "PUBLIC",
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "The note could not be saved.");
      }

      router.push("/admin/notes");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "The note could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950 dark:text-stone-50">New Research Note</h1>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleSubmit("DRAFT")}
            disabled={isSaving}
            className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium dark:border-stone-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save draft"}
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("PUBLIC")}
            disabled={isSaving}
            className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900 disabled:opacity-60"
          >
            Publish
          </button>
        </div>
      </div>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <aside className="space-y-4 rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Title
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Subtitle
            <input
              value={subtitle}
              onChange={(event) => setSubtitle(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
              placeholder="A structural reduction for additive decomposition problems"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Authors
            <input
              value={authors}
              onChange={(event) => setAuthors(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Subject
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            >
              <option value="DRAFT">Draft</option>
              <option value="PUBLIC">Public</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Short abstract
            <textarea
              value={abstract}
              onChange={(event) => setAbstract(event.target.value)}
              rows={4}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <div className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            Notes saved here appear in the public blog and notes view automatically.
          </div>
        </aside>

        <LatexEditor initialContent={content} onChange={setContent} />
      </div>
    </div>
  );
}
