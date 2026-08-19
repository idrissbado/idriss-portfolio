"use client";

import { useState } from "react";
import { LatexEditor } from "@/components/admin/latex-editor";

export default function NewNotePage() {
  const [title, setTitle] = useState("Goldbach Reduction Notes");
  const [content, setContent] = useState(`# Goldbach Reduction Notes

Let $n \ge 1$. We study the decomposition problem through a structural reduction.

$$
F(S,P)=S^5-5PS^3+5P^2S.
$$

## Main idea

This note provides a formal framework for additive identities relevant to research writing.
`);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">Admin</p>
          <h1 className="mt-2 text-3xl font-semibold text-stone-950 dark:text-stone-50">New Research Note</h1>
        </div>
        <div className="flex gap-2">
          <button type="button" className="rounded-full border border-stone-300 px-4 py-2 text-sm font-medium dark:border-stone-700">Save draft</button>
          <button type="button" className="rounded-full bg-stone-900 px-4 py-2 text-sm font-medium text-white dark:bg-stone-100 dark:text-stone-900">Publish</button>
        </div>
      </div>

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
            <input className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950" placeholder="A structural reduction for additive decomposition problems" />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Authors
            <input defaultValue="Idriss Olivier Bado" className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950" />
          </label>
          <label className="block text-sm font-medium text-stone-700 dark:text-stone-200">
            Subject
            <input defaultValue="Number Theory" className="mt-2 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-950" />
          </label>
          <div className="rounded-xl border border-dashed border-stone-300 p-4 text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
            Last saved: 14:32
          </div>
        </aside>

        <LatexEditor initialContent={content} onChange={setContent} />
      </div>
    </div>
  );
}
