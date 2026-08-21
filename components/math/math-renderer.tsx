import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { normalizeLatexDelimiters } from "@/lib/latex";

const remarkPlugins: NonNullable<ComponentProps<typeof ReactMarkdown>["remarkPlugins"]> = [remarkGfm, remarkMath];
const rehypePlugins: NonNullable<ComponentProps<typeof ReactMarkdown>["rehypePlugins"]> = [
  [
    rehypeKatex,
    {
      throwOnError: false,
      strict: "ignore",
      trust: false,
      macros: {
        "\\RR": "\\mathbb{R}",
        "\\NN": "\\mathbb{N}",
        "\\ZZ": "\\mathbb{Z}",
        "\\QQ": "\\mathbb{Q}",
        "\\CC": "\\mathbb{C}",
      },
    },
  ],
];

export function MathRenderer({ content }: { content: string }) {
  return (
    <div className="math-content max-w-none text-[1.02rem] leading-8">
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        skipHtml
      >
        {normalizeLatexDelimiters(content)}
      </ReactMarkdown>
    </div>
  );
}
