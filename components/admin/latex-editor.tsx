"use client";

import { useMemo, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { oneDark } from "@codemirror/theme-one-dark";
import { MathRenderer } from "@/components/math/math-renderer";

export function LatexEditor({
  initialContent,
  onChange,
}: {
  initialContent: string;
  onChange: (next: string) => void;
}) {
  const [view, setView] = useState<"source" | "preview">("source");
  const [value, setValue] = useState(initialContent);

  const extensions = useMemo(() => [markdown()], []);

  return (
    <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm dark:border-stone-800 dark:bg-stone-900">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
        <div className="flex gap-2 text-xs font-medium uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
          <button
            type="button"
            onClick={() => setView("source")}
            className={`rounded-full px-3 py-1.5 ${view === "source" ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "bg-stone-100 dark:bg-stone-800 dark:text-stone-200"}`}
          >
            Source
          </button>
          <button
            type="button"
            onClick={() => setView("preview")}
            className={`rounded-full px-3 py-1.5 ${view === "preview" ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : "bg-stone-100 dark:bg-stone-800 dark:text-stone-200"}`}
          >
            Preview
          </button>
        </div>
      </div>

      {view === "source" ? (
        <CodeMirror
          value={value}
          height="540px"
          extensions={extensions}
          theme={oneDark}
          onChange={(next) => {
            setValue(next);
            onChange(next);
          }}
        />
      ) : (
        <div className="min-h-[540px] bg-stone-50 p-6 dark:bg-stone-950">
          <MathRenderer content={value || "# Preview\n\nStart writing a mathematical note..."} />
        </div>
      )}
    </div>
  );
}
