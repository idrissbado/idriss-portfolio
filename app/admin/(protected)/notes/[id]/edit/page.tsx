"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { LatexEditor } from "@/components/admin/latex-editor";

type NoteRecord = {
  id: string;
  title: string;
  slug: string;
  subtitle?: string;
  abstract: string;
  authors: string;
  subject?: string;
  status: "Draft" | "Public" | "Private" | "Archived";
  tags: string[];
  content: string;
};

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const noteId = params?.id;
  const [note, setNote] = useState<NoteRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!noteId) {
      setIsLoading(false);
      return;
    }

    async function loadNote() {
      try {
        const response = await fetch(`/api/admin/notes?id=${encodeURIComponent(noteId)}`);
        if (!response.ok) {
          throw new Error("The note could not be loaded.");
        }
        const payload = await response.json();
        setNote(payload.note ?? null);
      } catch (err) {
        setError((err as Error).message || "The note could not be loaded.");
      } finally {
        setIsLoading(false);
      }
    }

    loadNote();
  }, [noteId]);

  async function handleSave() {
    if (!note || !noteId) {
      return;
    }

    setError("");
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/notes?id=${encodeURIComponent(noteId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: note.title,
          subtitle: note.subtitle,
          abstract: note.abstract,
          authors: note.authors,
          subject: note.subject,
          status: note.status === "Public" ? "PUBLIC" : "DRAFT",
          tags: note.tags,
          content: note.content,
          featured: note.status === "Public",
        }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || "The note could not be updated.");
      }

      router.push("/admin/notes");
      router.refresh();
    } catch (err) {
      setError((err as Error).message || "The note could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <div className="mx-auto max-w-5xl px-4 py-10 text-sm text-stone-600">Loading note…</div>;
  }

  if (!note) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "This note could not be found."}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950 dark:text-stone-50">Edit note</h1>
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900 disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save changes"}
        </button>
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
              value={note.title}
              onChange={(event) => setNote((current) => current ? { ...current, title: event.target.value } : current)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Subtitle
            <input
              value={note.subtitle ?? ""}
              onChange={(event) => setNote((current) => current ? { ...current, subtitle: event.target.value } : current)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Authors
            <input
              value={note.authors}
              onChange={(event) => setNote((current) => current ? { ...current, authors: event.target.value } : current)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Subject
            <input
              value={note.subject ?? ""}
              onChange={(event) => setNote((current) => current ? { ...current, subject: event.target.value } : current)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Status
            <select
              value={note.status}
              onChange={(event) => setNote((current) => current ? { ...current, status: event.target.value as NoteRecord["status"] } : current)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            >
              <option value="Draft">Draft</option>
              <option value="Public">Public</option>
              <option value="Private">Private</option>
              <option value="Archived">Archived</option>
            </select>
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Abstract
            <textarea
              value={note.abstract}
              rows={4}
              onChange={(event) => setNote((current) => current ? { ...current, abstract: event.target.value } : current)}
              className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950"
            />
          </label>
        </aside>

        <LatexEditor
          initialContent={note.content}
          onChange={(value) => setNote((current) => current ? { ...current, content: value } : current)}
        />
      </div>
    </div>
  );
}
