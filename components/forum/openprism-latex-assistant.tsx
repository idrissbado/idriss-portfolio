"use client";

import { useRef, useState } from "react";
import { MathRenderer } from "@/components/math/math-renderer";

type AssistantResult = {
  result: string;
  latex: string;
};

function readImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("The image could not be read."));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}

export function OpenPrismLatexAssistant({ isAuthenticated }: { isAuthenticated: boolean }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prompt, setPrompt] = useState("");
  const [imageDataUrl, setImageDataUrl] = useState("");
  const [imageName, setImageName] = useState("");
  const [result, setResult] = useState<AssistantResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const attachImage = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 6 * 1024 * 1024) {
      setError("Please choose a PNG, JPEG, or WebP image smaller than 6 MB.");
      return;
    }

    try {
      setImageDataUrl(await readImage(file));
      setImageName(file.name);
      setError("");
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : "The image could not be attached.");
    }
  };

  const generateLatex = async () => {
    if (!isAuthenticated) {
      setError("Log in with a verified account to use the AI assistant.");
      return;
    }
    if (!prompt.trim() && !imageDataUrl) {
      setError("Describe the formula or attach an image first.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/ai/latex", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, imageDataUrl: imageDataUrl || undefined }),
      });
      const payload = (await response.json()) as AssistantResult & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "The AI assistant could not generate LaTeX.");
      setResult({ result: payload.result, latex: payload.latex });
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The AI assistant could not generate LaTeX.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 rounded-2xl border border-sky-200 bg-white p-4 shadow-sm dark:border-sky-900 dark:bg-stone-900">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">OpenPrism assistant</div>
          <h2 className="mt-1 text-xl font-semibold text-stone-900 dark:text-stone-50">Turn an image or idea into LaTeX</h2>
          <p className="mt-1 text-sm leading-6 text-stone-600 dark:text-stone-300">Describe a formula, or upload a screenshot and review the generated source before using it.</p>
        </div>
        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-sky-700 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300">Vision + LaTeX</span>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          className="min-h-32 w-full rounded-xl border border-stone-300 bg-stone-50 px-3 py-3 text-sm text-stone-900 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-100 dark:border-stone-700 dark:bg-stone-950 dark:text-stone-50"
          placeholder="Example: write the LaTeX for the inequality shown and use aligned equations."
          disabled={!isAuthenticated || isSubmitting}
        />
        <div
          className="flex min-h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 px-3 py-4 text-center transition hover:border-sky-400 dark:border-stone-700 dark:bg-stone-950"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            void attachImage(event.dataTransfer.files[0]);
          }}
        >
          <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => void attachImage(event.target.files?.[0])} />
          {imageDataUrl ? <img src={imageDataUrl} alt="Selected formula" className="max-h-20 rounded-lg object-contain" /> : <span className="text-sm font-medium text-stone-700 dark:text-stone-200">Browse or drop image</span>}
          <span className="mt-2 text-xs text-stone-500 dark:text-stone-400">{imageName || "PNG, JPEG, WebP · 6 MB max"}</span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button type="button" onClick={() => void generateLatex()} disabled={isSubmitting || !isAuthenticated} className="rounded-full bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting ? "Generating..." : "Generate LaTeX"}
        </button>
        {imageDataUrl ? <button type="button" onClick={() => { setImageDataUrl(""); setImageName(""); }} className="rounded-full border border-stone-300 px-4 py-2.5 text-sm font-medium text-stone-700 hover:border-stone-500 dark:border-stone-700 dark:text-stone-200">Remove image</button> : null}
      </div>

      {error ? <p aria-live="polite" className="mt-3 text-sm text-rose-600 dark:text-rose-400">{error}</p> : null}
      {result ? (
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-stone-200 bg-stone-50 p-4 dark:border-stone-800 dark:bg-stone-950">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Generated source</div>
            <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap text-xs leading-6 text-stone-800 dark:text-stone-200"><code>{result.latex}</code></pre>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">Preview</div>
            <div className="mt-3 text-sm leading-7 text-stone-700 dark:text-stone-200"><MathRenderer content={result.latex} /></div>
          </div>
          <div className="lg:col-span-2 rounded-xl border border-stone-200 bg-stone-50 p-4 text-sm leading-6 text-stone-700 dark:border-stone-800 dark:bg-stone-950 dark:text-stone-300"><MathRenderer content={result.result} variant="compact" /></div>
        </div>
      ) : null}
    </div>
  );
}
