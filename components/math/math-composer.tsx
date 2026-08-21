"use client";

import { useId, useRef, useState } from "react";
import { MathRenderer } from "@/components/math/math-renderer";
import { cn } from "@/lib/utils";

type MathComposerProps = {
  value: string;
  onChange: (value: string) => void;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeightClassName?: string;
};

export function MathComposer({
  value,
  onChange,
  id,
  placeholder,
  disabled = false,
  className,
  minHeightClassName = "min-h-40",
}: MathComposerProps) {
  const generatedId = useId();
  const editorId = id ?? generatedId;
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [view, setView] = useState<"write" | "preview">("write");

  const insertSnippet = (before: string, after: string, fallback: string) => {
    const textarea = textareaRef.current;
    const start = textarea?.selectionStart ?? value.length;
    const end = textarea?.selectionEnd ?? value.length;
    const selectedText = value.slice(start, end) || fallback;
    const nextValue = `${value.slice(0, start)}${before}${selectedText}${after}${value.slice(end)}`;
    const selectionStart = start + before.length;
    const selectionEnd = selectionStart + selectedText.length;

    onChange(nextValue);

    window.requestAnimationFrame(() => {
      textareaRef.current?.focus();
      textareaRef.current?.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  return (
    <div className={cn("overflow-hidden rounded-[18px] border border-stone-300 bg-white dark:border-stone-700 dark:bg-stone-950", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 bg-stone-50 px-2.5 py-2 dark:border-stone-800 dark:bg-stone-900">
        <div className="flex items-center gap-1" aria-label="Answer editor view">
          {(["write", "preview"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              aria-pressed={view === tab}
              onClick={() => setView(tab)}
              disabled={disabled}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition disabled:cursor-not-allowed disabled:opacity-60",
                view === tab
                  ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                  : "text-stone-600 hover:bg-stone-200 dark:text-stone-300 dark:hover:bg-stone-800",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {view === "write" ? (
          <div className="flex flex-wrap items-center gap-1" aria-label="Formatting tools">
            <button
              type="button"
              onClick={() => insertSnippet("**", "**", "bold text")}
              disabled={disabled}
              className="math-editor-tool font-bold"
              aria-label="Bold"
              title="Bold"
            >
              B
            </button>
            <button
              type="button"
              onClick={() => insertSnippet("$", "$", "x^2")}
              disabled={disabled}
              className="math-editor-tool font-serif"
              aria-label="Inline equation"
              title="Inline equation"
            >
              x²
            </button>
            <button
              type="button"
              onClick={() => insertSnippet("\n$$\n", "\n$$", "\\int_0^1 f(x)\\,dx")}
              disabled={disabled}
              className="math-editor-tool font-serif"
              aria-label="Display equation"
              title="Display equation"
            >
              ∫
            </button>
            <button
              type="button"
              onClick={() => insertSnippet("\\frac{", "}{b}", "a")}
              disabled={disabled}
              className="math-editor-tool font-serif"
              aria-label="Fraction"
              title="Fraction"
            >
              a⁄b
            </button>
          </div>
        ) : null}
      </div>

      {view === "write" ? (
        <textarea
          ref={textareaRef}
          id={editorId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "w-full resize-y border-0 bg-transparent px-4 py-3 font-mono text-sm leading-7 text-stone-900 outline-none placeholder:font-sans placeholder:text-stone-400 disabled:cursor-not-allowed disabled:opacity-70 dark:text-stone-50",
            minHeightClassName,
          )}
        />
      ) : (
        <div className={cn("overflow-auto px-4 py-3", minHeightClassName)}>
          {value.trim() ? (
            <MathRenderer content={value} />
          ) : (
            <p className="text-sm text-stone-500 dark:text-stone-400">Your formatted answer will appear here.</p>
          )}
        </div>
      )}

      <div className="border-t border-stone-200 bg-stone-50 px-3 py-2 text-xs leading-5 text-stone-500 dark:border-stone-800 dark:bg-stone-900 dark:text-stone-400">
        Markdown and LaTeX supported: <code>$...$</code>, <code>$$...$$</code>, <code>\(...\)</code>, and <code>\[...\]</code>.
      </div>
    </div>
  );
}
