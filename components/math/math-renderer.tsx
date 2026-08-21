import type { ComponentProps } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { normalizeLatexDelimiters } from "@/lib/latex";
import { cn } from "@/lib/utils";

const remarkPlugins: NonNullable<ComponentProps<typeof ReactMarkdown>["remarkPlugins"]> = [remarkGfm, remarkMath];
const KATEX_ERROR_COLOR = "#ff00fe";

type MathTreeNode = {
  type?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: MathTreeNode[];
};

function rehypeHideInvalidLatex() {
  return (tree: MathTreeNode) => {
    const getClassNames = (node: MathTreeNode) => {
      const className = node.properties?.className;
      return Array.isArray(className) ? className.map(String) : String(className ?? "").split(/\s+/);
    };

    const containsKatexError = (node: MathTreeNode): boolean => {
      if (getClassNames(node).includes("katex-error")) {
        return true;
      }

      const hasErrorColor = Object.values(node.properties ?? {}).some((value) =>
        String(value).toLowerCase().includes(KATEX_ERROR_COLOR),
      );

      return hasErrorColor || Boolean(node.children?.some(containsKatexError));
    };

    const replaceWithSafeError = (node: MathTreeNode) => {
      node.properties = {
        ...node.properties,
        "aria-label": "Invalid mathematical expression",
        className: ["math-render-error"],
        role: "status",
        title: "Invalid LaTeX expression",
      };
      node.children = [{ type: "text", value: "Equation could not be rendered." }];
    };

    const visit = (node: MathTreeNode) => {
      const classNames = getClassNames(node);

      if ((classNames.includes("katex") || classNames.includes("katex-error")) && containsKatexError(node)) {
        replaceWithSafeError(node);
        return;
      }

      node.children?.forEach(visit);
    };

    visit(tree);
  };
}

const rehypePlugins: NonNullable<ComponentProps<typeof ReactMarkdown>["rehypePlugins"]> = [
  [
    rehypeKatex,
    {
      throwOnError: false,
      errorColor: KATEX_ERROR_COLOR,
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
  rehypeHideInvalidLatex,
];

const inlineComponents: NonNullable<ComponentProps<typeof ReactMarkdown>["components"]> = {
  p: ({ children }) => <>{children}</>,
  a: ({ children }) => <>{children}</>,
};

type MathRendererProps = {
  content: string;
  variant?: "body" | "compact" | "inline" | "title";
  className?: string;
};

export function MathRenderer({ content, variant = "body", className }: MathRendererProps) {
  const isInlineLayout = variant === "inline" || variant === "title";
  const normalizedContent = normalizeLatexDelimiters(content, { inlineOnly: isInlineLayout });
  const markdown = (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={rehypePlugins}
      components={isInlineLayout ? inlineComponents : undefined}
      skipHtml
    >
      {normalizedContent}
    </ReactMarkdown>
  );

  if (isInlineLayout) {
    return <span className={cn(variant === "title" ? "math-title" : "math-inline", className)}>{markdown}</span>;
  }

  return (
    <div
      className={cn(
        "math-content max-w-none",
        variant === "compact" ? "math-content-compact text-sm leading-6" : "text-[1.02rem] leading-8",
        className,
      )}
    >
      {markdown}
    </div>
  );
}
