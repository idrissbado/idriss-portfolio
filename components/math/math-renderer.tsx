"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export function MathRenderer({ content }: { content: string }) {
  return (
    <div className="prose prose-stone max-w-none text-[1.02rem] leading-8 dark:prose-invert prose-headings:font-semibold prose-headings:tracking-tight prose-p:leading-8 prose-blockquote:border-stone-300 prose-blockquote:text-stone-700 dark:prose-blockquote:border-stone-700 dark:prose-blockquote:text-stone-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
