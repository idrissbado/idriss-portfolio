import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MathRenderer } from "@/components/math/math-renderer";
import { normalizeLatexDelimiters } from "@/lib/latex";

describe("LaTeX rendering", () => {
  it("normalizes parenthesis and bracket delimiters", () => {
    const normalized = normalizeLatexDelimiters("Inline \\(x^2\\)\n\n\\[x+y=z\\]");

    expect(normalized).toContain("Inline $x^2$");
    expect(normalized).toContain("$$\nx+y=z\n$$");
  });

  it("does not alter LaTeX-looking delimiters inside code", () => {
    const markdown = "`\\(inline example\\)`\n\n```tex\n\\[display example\\]\n\\begin{align}a&=b\\end{align}\n```";

    expect(normalizeLatexDelimiters(markdown)).toBe(markdown);
  });

  it("turns standalone LaTeX environments into display math", () => {
    const latex = String.raw`\begin{align*}
      a&=b\\
      c&=d
    \end{align*}`;
    const normalized = normalizeLatexDelimiters(latex);

    expect(normalized).toContain("$$");
    expect(normalized).toContain("\\begin{align*}");
    expect(normalized).toContain("\\end{align*}");
  });

  it("does not double-wrap environments that already use math delimiters", () => {
    const latex = String.raw`$$
\begin{pmatrix}a&b\\c&d\end{pmatrix}
$$`;

    expect(normalizeLatexDelimiters(latex)).toBe(latex);
  });

  it("renders inline and display equations with KaTeX", () => {
    const html = renderToStaticMarkup(
      <MathRenderer content={"Inline \\(x^2\\)\n\n\\[\\sum_{n=1}^{\\infty} n^{-2}\\]"} />,
    );

    expect(html).toContain("class=\"katex\"");
    expect(html).toContain("class=\"katex-display\"");
    expect(html).toContain("math-content");
  });

  it("keeps stacked inline fractions visible below the fraction bar", () => {
    const html = renderToStaticMarkup(<MathRenderer content={String.raw`If $x+\frac{1}{x}$ is an integer.`} />);
    const css = readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8");

    expect(html).toContain("mfrac");
    expect(html).toContain("frac-line");
    expect(css).toMatch(/\.math-inline\s*>\s*\.katex\s*\{[^}]*overflow:\s*visible;/);
    expect(css).not.toMatch(/\.math-inline\s*>\s*\.katex\s*\{[^}]*overflow-y:\s*hidden;/);
  });

  it("renders LaTeX titles inline without a paragraph wrapper", () => {
    const html = renderToStaticMarkup(
      <MathRenderer content={"How to prove $x^{6n\\pm1}+\\frac{1}{x^{6n\\pm1}}$?"} variant="inline" />,
    );

    expect(html).toContain("math-inline");
    expect(html).toContain("class=\"katex\"");
    expect(html).not.toContain("<p>");
  });

  it("uses compact typography for forum excerpts with several equations", () => {
    const excerpt = "If $x+\\frac{1}{x}$ is an integer, prove that $$x^{6n+1}+\\frac{1}{x^{6n+1}}$$ has the same units digit.";
    const html = renderToStaticMarkup(<MathRenderer content={excerpt} variant="compact" />);

    expect(html).toContain("math-content-compact");
    expect(html).toContain("class=\"katex\"");
    expect(html).not.toContain("katex-error");
  });

  it("renders professional LaTeX environments without exposing commands", () => {
    const content = String.raw`
\begin{equation}x^2+1=0\end{equation}

\begin{align*}a&=b\\c&=d\end{align*}

\begin{gather}u=v\\w=z\end{gather}

\begin{cases}x,&x\geq0\\-x,&x<0\end{cases}

\begin{matrix}a&b\\c&d\end{matrix}

\begin{pmatrix}a&b\\c&d\end{pmatrix}

\begin{bmatrix}a&b\\c&d\end{bmatrix}

\begin{array}{cc}a&b\\c&d\end{array}
`;
    const html = renderToStaticMarkup(<MathRenderer content={content} />);

    expect(html).toContain("katex-display");
    expect(html).toContain("mtable");
    expect(html).not.toContain("katex-error");
    expect(html).not.toContain("Equation could not be rendered.");
  });

  it("replaces invalid LaTeX with a readable error instead of raw commands", () => {
    const html = renderToStaticMarkup(<MathRenderer content={String.raw`$\notARealCommand{x}$`} />);

    expect(html).toContain("Equation could not be rendered.");
    expect(html).not.toContain("\\notARealCommand");
  });
});
