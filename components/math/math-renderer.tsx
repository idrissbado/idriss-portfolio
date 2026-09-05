import type { ComponentProps, ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { MathSvgRenderer } from "@/components/math/math-svg-renderer";
import { prepareLatexDocument } from "@/lib/latex-document";
import { normalizeLatexDelimiters } from "@/lib/latex";
import { cn } from "@/lib/utils";

const remarkPlugins: NonNullable<ComponentProps<typeof ReactMarkdown>["remarkPlugins"]> = [remarkGfm, remarkMath];
const KATEX_ERROR_COLOR = "#ff00fe";

type MathTreeNode = {
  type?: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: MathTreeNode[];
};

function getClassNames(node: MathTreeNode) {
  const className = node.properties?.className;
  return Array.isArray(className) ? className.map(String) : String(className ?? "").split(/\s+/);
}

function containsKatexError(node: MathTreeNode): boolean {
  if (getClassNames(node).includes("katex-error")) {
    return true;
  }

  const hasErrorColor = Object.values(node.properties ?? {}).some((value) =>
    String(value).toLowerCase().includes(KATEX_ERROR_COLOR),
  );

  return hasErrorColor || Boolean(node.children?.some(containsKatexError));
}

/**
 * Some extensions have to bypass KaTeX entirely. Their TeX payload is copied
 * unchanged and rendered by the MathJax/XyJax server fallback.
 */
function rehypeExtractMathJaxExtensions() {
  return (tree: MathTreeNode) => {
    const visit = (node: MathTreeNode) => {
      const classNames = getClassNames(node);
      const isMathNode = classNames.includes("math-inline") || classNames.includes("math-display");
      const latex = node.children
        ?.filter((child) => child.type === "text")
        .map((child) => child.value ?? "")
        .join("");

      if (isMathNode && latex?.includes("\\xymatrix")) {
        node.type = "element";
        node.tagName = "math-svg";
        node.properties = {
          // XY-pic diagrams need their own scrollable row even when an author
          // used single-dollar delimiters around the command.
          display: "true",
        };
        node.children = [{ type: "text", value: latex }];
        return;
      }

      node.children?.forEach(visit);
    };

    visit(tree);
  };
}

/**
 * A KaTeX parse error may still be valid MathJax LaTeX. Route the untouched
 * expression to the broader server renderer before showing a final error.
 */
function rehypeFallbackForUnsupportedKatex() {
  return (tree: MathTreeNode) => {
    const textContent = (node: MathTreeNode): string =>
      node.type === "text" ? node.value ?? "" : node.children?.map(textContent).join("") ?? "";

    const findLatexAnnotation = (node: MathTreeNode): string | undefined => {
      if (node.tagName === "annotation" && node.properties?.encoding === "application/x-tex") {
        return textContent(node);
      }

      for (const child of node.children ?? []) {
        const annotation = findLatexAnnotation(child);
        if (annotation !== undefined) {
          return annotation;
        }
      }

      return undefined;
    };

    const visit = (node: MathTreeNode, parent?: MathTreeNode) => {
      const classNames = getClassNames(node);
      const isKatexError =
        classNames.includes("katex-error") || (classNames.includes("katex") && containsKatexError(node));

      if (isKatexError) {
        const latex = findLatexAnnotation(node) ?? textContent(node);

        node.type = "element";
        node.tagName = "math-svg";
        node.properties = {
          // Inline math is normally inside a paragraph. Flow math is a direct
          // child of the root, a list item, a quote, or another block element.
          display: parent?.tagName === "p" ? "false" : "true",
        };
        node.children = [{ type: "text", value: latex }];
        return;
      }

      node.children?.forEach((child) => visit(child, node));
    };

    visit(tree);
  };
}

function rehypeHideInvalidLatex() {
  return (tree: MathTreeNode) => {
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

const DEFAULT_MACROS: Record<string, string> = {
  // Give forum fractions display-style vertical clearance while keeping the
  // submitted source unchanged. Authors can use \tfrac for compact fractions.
  "\\frac": "\\dfrac{#1}{#2}",
  "\\R": "\\mathbb{R}",
  "\\N": "\\mathbb{N}",
  "\\Z": "\\mathbb{Z}",
  "\\Q": "\\mathbb{Q}",
  "\\C": "\\mathbb{C}",
  "\\RR": "\\mathbb{R}",
  "\\NN": "\\mathbb{N}",
  "\\ZZ": "\\mathbb{Z}",
  "\\QQ": "\\mathbb{Q}",
  "\\CC": "\\mathbb{C}",
};

function createRehypePlugins(macros: Record<string, string>) {
  return [
    rehypeExtractMathJaxExtensions,
    [
      rehypeKatex,
      {
        throwOnError: false,
        errorColor: KATEX_ERROR_COLOR,
        strict: "ignore",
        trust: false,
        macros,
      },
    ],
    rehypeFallbackForUnsupportedKatex,
    rehypeHideInvalidLatex,
  ] as NonNullable<ComponentProps<typeof ReactMarkdown>["rehypePlugins"]>;
}

type MathSvgComponentProps = {
  children?: ReactNode;
  display?: string;
};

function createMathSvgComponents(macros: Record<string, string>) {
  return {
    "math-svg": ({ children, display }: MathSvgComponentProps) => (
      <MathSvgRenderer latex={String(children ?? "")} display={display === "true"} macros={macros} />
    ),
  } as unknown as NonNullable<ComponentProps<typeof ReactMarkdown>["components"]>;
}

type MathRendererProps = {
  content: string;
  variant?: "body" | "compact" | "inline" | "title";
  className?: string;
};

export function MathRenderer({ content, variant = "body", className }: MathRendererProps) {
  const isInlineLayout = variant === "inline" || variant === "title";
  const preparedDocument = prepareLatexDocument(content);
  const macros = { ...DEFAULT_MACROS, ...preparedDocument.macros };
  const normalizedContent = normalizeLatexDelimiters(preparedDocument.content, { inlineOnly: isInlineLayout });
  const mathSvgComponents = createMathSvgComponents(macros);
  const components = isInlineLayout
    ? {
        ...mathSvgComponents,
        p: ({ children }: { children?: ReactNode }) => <>{children}</>,
        a: ({ children }: { children?: ReactNode }) => <>{children}</>,
      }
    : mathSvgComponents;
  const markdown = (
    <ReactMarkdown
      remarkPlugins={remarkPlugins}
      rehypePlugins={createRehypePlugins(macros)}
      components={components}
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
