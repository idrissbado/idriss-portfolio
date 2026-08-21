import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MathRenderer } from "@/components/math/math-renderer";
import { normalizeLatexDelimiters } from "@/lib/latex";

const REQUIRED_INLINE_CASES = [
  String.raw`$x+\frac{1}{x}$`,
  String.raw`$x^{6n+1}+\frac{1}{x^{6n+1}}$`,
  String.raw`$x^{6n-1}+\frac{1}{x^{6n-1}}$`,
  String.raw`$\frac{x^{n+1}+1}{x^{2n-1}}$`,
  String.raw`$\frac{1}{x^{a+b+c}}$`,
  String.raw`$\sqrt{\frac{x^{2}+1}{x^{2}-1}}$`,
  String.raw`$\sum_{k=1}^{n}\frac{1}{k^2}$`,
];

const POWERED_DENOMINATORS = [
  String.raw`x^{6n+1}+\frac{1}{x^{6n+1}}`,
  String.raw`x^{6n-1}+\frac{1}{x^{6n-1}}`,
  String.raw`x^{6n\pm1}+\frac{1}{x^{6n\pm1}}`,
  String.raw`\frac{1}{x^{a+b+c}}`,
];

function renderMath(content: string, variant: "body" | "compact" | "inline" | "title" = "body") {
  return renderToStaticMarkup(<MathRenderer content={content} variant={variant} />);
}

function firstMathMlFraction(html: string) {
  const start = html.indexOf("<mfrac>");
  const end = html.indexOf("</mfrac>", start);

  expect(start).toBeGreaterThanOrEqual(0);
  expect(end).toBeGreaterThan(start);
  return html.slice(start, end + "</mfrac>".length);
}

describe("LaTeX delimiter normalization", () => {
  it("supports parenthesis and bracket delimiters", () => {
    const normalized = normalizeLatexDelimiters("Inline \\(x^2\\)\n\n\\[x+y=z\\]");

    expect(normalized).toContain("Inline $x^2$");
    expect(normalized).toContain("$$\nx+y=z\n$$");
  });

  it("copies the complete fraction payload without changing braces or commands", () => {
    const expression = String.raw`x^{6n\pm1} + \frac{1}{x^{6n\pm1}}`;

    expect(normalizeLatexDelimiters(`\\(${expression}\\)`)).toBe(`$${expression}$`);
    expect(normalizeLatexDelimiters(`$$${expression}$$`, { inlineOnly: true })).toBe(`$${expression}$`);

    const display = normalizeLatexDelimiters(`\\[${expression}\\]`);
    expect(display).toContain(expression);
    expect(display.match(/x\^\{6n\\pm1\}/g)).toHaveLength(2);
  });

  it("does not alter LaTeX-looking delimiters inside Markdown code", () => {
    const markdown = "`\\(inline example\\)`\n\n```tex\n\\[display example\\]\n\\begin{align}a&=b\\end{align}\n```";

    expect(normalizeLatexDelimiters(markdown)).toBe(markdown);
  });

  it("turns standalone and nested LaTeX environments into display math", () => {
    const latex = String.raw`\begin{align*}
      A&=\begin{pmatrix}a&b\\c&d\end{pmatrix}\\
      c&=d
    \end{align*}`;
    const normalized = normalizeLatexDelimiters(latex);

    expect(normalized).toContain("$$");
    expect(normalized).toContain(latex);
  });

  it("does not double-wrap environments already inside math delimiters", () => {
    const latex = String.raw`$$
\begin{pmatrix}a&b\\c&d\end{pmatrix}
$$`;

    expect(normalizeLatexDelimiters(latex)).toBe(latex);
  });

  it("promotes double-dollar formulas written inside prose without changing their payload", () => {
    const first = String.raw` x^{6n+1}+\frac{1}{x^{6n+1}} `;
    const second = String.raw` x^{6n-1}+\frac{1}{x^{6n-1}} `;
    const content = `Prove that $$${first}$$ and $$${second}$$ have the same units digit.`;
    const normalized = normalizeLatexDelimiters(content);
    const html = renderMath(content);

    expect(normalized).toContain(first);
    expect(normalized).toContain(second);
    expect(html.match(/class="katex-display"/g)).toHaveLength(2);
    expect(html).not.toContain("katex-error");
  });
});

describe("professional KaTeX rendering", () => {
  it.each(REQUIRED_INLINE_CASES)("renders the regression formula %s", (source) => {
    const html = renderMath(source);

    expect(html).toContain("class=\"katex\"");
    expect(html).toContain("<mfrac>");
    expect(html).toContain("class=\"mfrac\"");
    expect(html).toContain("frac-line");
    expect(html).not.toContain("katex-error");
    expect(html).not.toContain("Equation could not be rendered.");
  });

  it.each(POWERED_DENOMINATORS)("keeps the superscript inside the denominator for %s", (expression) => {
    const html = renderMath(`$${expression}$`);
    const fraction = firstMathMlFraction(html);

    expect(fraction).toContain("<msup><mi>x</mi>");
    expect(fraction).toContain("</msup></mfrac>");
  });

  it("adds clear vertical space between the fraction bar and denominator", () => {
    const html = renderMath(String.raw`$x+\frac{1}{x^{6n+1}}$`);

    // Display-style fractions keep the denominator at full math size instead
    // of compressing it into KaTeX's cramped inline fraction style.
    expect(html).toContain('class="mfrac"');
    expect(html).not.toContain("reset-size3 size1 mtight");
    expect(firstMathMlFraction(html)).toContain("</msup></mfrac>");
  });

  it("renders roots, sums, limits, products, matrices, and aligned equations structurally", () => {
    const content = String.raw`
$$\sqrt{\frac{x^2+1}{x^2-1}}$$

$$\sum_{k=1}^{n}\frac{1}{k^2}+\prod_{j=1}^{m}j$$

$$\lim_{x\to0}\frac{\sin x}{x}$$

\begin{align*}
A&=\begin{pmatrix}a&b\\c&d\end{pmatrix}\\
B&=\begin{cases}x,&x\geq0\\-x,&x<0\end{cases}
\end{align*}`;
    const html = renderMath(content);

    expect(html).toContain("<msqrt>");
    expect(html).toContain("∑");
    expect(html).toContain("∏");
    expect(html).toContain("lim");
    expect(html).toContain("class=\"mtable\"");
    expect(html).not.toContain("katex-error");
  });

  it("renders all supported inline and display delimiter forms", () => {
    const expression = String.raw`x^{6n+1}+\frac{1}{x^{6n+1}}`;
    const inlineDollar = renderMath(`$${expression}$`);
    const inlineParentheses = renderMath(`\\(${expression}\\)`);
    const displayDollar = renderMath(`$$\n${expression}\n$$`);
    const displayBrackets = renderMath(`\\[${expression}\\]`);

    expect(inlineDollar).not.toContain("katex-display");
    expect(inlineParentheses).not.toContain("katex-display");
    expect(displayDollar).toContain("class=\"katex-display\"");
    expect(displayBrackets).toContain("class=\"katex-display\"");

    for (const html of [inlineDollar, inlineParentheses, displayDollar, displayBrackets]) {
      expect(firstMathMlFraction(html)).toContain("</msup></mfrac>");
      expect(html).not.toContain("katex-error");
    }
  });

  it("renders the exact reported question in titles, bodies, answers, and previews through the shared renderer", () => {
    const expression = String.raw`x^{6n\pm1}+\frac{1}{x^{6n\pm1}}`;
    const titleHtml = renderMath(`How to prove $$${expression}$$?`, "title");
    const bodyHtml = renderMath(`The expression is $${expression}$.`);
    const compactHtml = renderMath(`Answer: $${expression}$.`, "compact");

    for (const html of [titleHtml, bodyHtml, compactHtml]) {
      expect(firstMathMlFraction(html)).toContain("</msup></mfrac>");
      expect(html).not.toContain("katex-error");
    }

    expect(titleHtml).toContain("math-title");
    expect(titleHtml).not.toContain("katex-display");
    expect(titleHtml).not.toContain("<p>");

    const forumPage = readFileSync(path.resolve(__dirname, "../components/forum/forum-page-client.tsx"), "utf8");
    const threadPage = readFileSync(path.resolve(__dirname, "../components/forum/forum-thread-page-client.tsx"), "utf8");
    const composer = readFileSync(path.resolve(__dirname, "../components/math/math-composer.tsx"), "utf8");

    expect(forumPage.match(/<MathRenderer/g)?.length).toBeGreaterThanOrEqual(4);
    expect(threadPage.match(/<MathRenderer/g)?.length).toBeGreaterThanOrEqual(3);
    expect(composer).toContain("<MathRenderer content={value}");
  });

  it("leaves KaTeX font metrics and internal positioning under KaTeX control", () => {
    const css = readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8");
    const layout = readFileSync(path.resolve(__dirname, "../app/layout.tsx"), "utf8");
    const applicationKatexRules = css.match(/[^{}]*\.katex[^{}]*\{[^{}]*\}/g) ?? [];

    expect(css).not.toMatch(/(?:^|,)\s*span\s*(?:,|\{)/m);
    expect(
      applicationKatexRules.every((rule) => rule.includes(".katex-display") || rule.includes(".katex-error")),
    ).toBe(true);
    expect(css).toMatch(/\.math-content \.katex-display\s*\{[^}]*overflow-x:\s*auto;/);
    expect(css).toMatch(/\.math-content \.katex-display\s*\{[^}]*overflow-y:\s*hidden;/);
    expect(layout.indexOf('import "katex/dist/katex.min.css"')).toBeLessThan(layout.indexOf('import "./globals.css"'));
  });

  it("replaces invalid LaTeX with a readable error instead of raw commands", () => {
    const html = renderMath(String.raw`$\notARealCommand{x}$`);

    expect(html).toContain("Equation could not be rendered.");
    expect(html).not.toContain("\\notARealCommand");
  });
});
