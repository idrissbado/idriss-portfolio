import { readFileSync } from "node:fs";
import path from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { POST as renderMathSvg } from "@/app/api/math/render/route";
import { MathRenderer } from "@/components/math/math-renderer";
import { createLatexExcerpt, prepareLatexDocument } from "@/lib/latex-document";
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

const REPORTED_XY_MATRIX = String.raw`\xymatrix {& & &(1,1,1,1)\ar[d]^{f,g,h}&&&\\&&&(1,1,1,3)\ar[d]^{f,g,h}&&&\\&&&(1,1,3,11)\ar[lld]^h \ar[rrd]^{f,g}&&&\\ &(1,1,11,41)\ar[ld]^h\ar[rd]^{f,g}&&&& (1,3,11,131)\ar[ld]^h\ar[d]^g\ar[rd]^f\\(1,1,41,153)&&(1,11,41,1803)&&(1,3,131,1561)&(1,11,131,5761)&(3,11,131,17291) }`;

const MATRIX_ENVIRONMENTS = [
  String.raw`\begin{matrix}a&b\\c&d\end{matrix}`,
  String.raw`\begin{pmatrix}a&b\\c&d\end{pmatrix}`,
  String.raw`\begin{bmatrix}a&b\\c&d\end{bmatrix}`,
  String.raw`\begin{Bmatrix}a&b\\c&d\end{Bmatrix}`,
  String.raw`\begin{vmatrix}a&b\\c&d\end{vmatrix}`,
  String.raw`\begin{Vmatrix}a&b\\c&d\end{Vmatrix}`,
  String.raw`\begin{array}{cc}a&b\\c&d\end{array}`,
  String.raw`\begin{cases}x^2,&x\geq0\\-x,&x<0\end{cases}`,
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

const COMPLETE_EXERCISE_DOCUMENT = String.raw`\documentclass[11pt]{article}
\usepackage{amsmath,amssymb,amsthm}
\newtheorem{exercise}{Exercise}
\newcommand{\R}{\mathbb{R}}
\newcommand{\Carlson}[1]{\sum_{k=1}^{#1} a_k}
\title{A sharp Hardy-type inequality}
\author{Forum member}
\begin{document}
\maketitle
\section{The problem}
\begin{exercise}[Inégalité de Carlson]
Soit $(a_n)_{n\geq 1}$ une suite de réels positifs telle que
\[
\Carlson{n}\leq \sqrt{n\sum_{k=1}^{n}a_k^2}.
\]
\begin{enumerate}
\item Établir l'inégalité.
\item Étudier le cas d'égalité.
\end{enumerate}
\end{exercise}
\begin{proof}
Par Cauchy--Schwarz, le résultat suit.
\end{proof}
\end{document}`;

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

  it.each(["multline", "multline*", "split", "eqnarray", "eqnarray*", "subarray", "CD"])(
    "recognizes the standalone %s environment",
    (environment) => {
      const latex = `\\begin{${environment}}a=b\\end{${environment}}`;
      const normalized = normalizeLatexDelimiters(latex);

      expect(normalized).toContain("$$");
      expect(normalized).toContain(latex);
    },
  );

  it("keeps the LaTeX math environment inline", () => {
    const latex = String.raw`Text \begin{math}x+1\end{math} continues.`;
    const normalized = normalizeLatexDelimiters(latex);

    expect(normalized).toBe(String.raw`Text $\begin{math}x+1\end{math}$ continues.`);
    expect(renderMath(latex)).not.toContain("katex-display");
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

describe("complete LaTeX document import", () => {
  it("accepts a document preamble and renders exercise, proof, headings, lists, and math", () => {
    const prepared = prepareLatexDocument(COMPLETE_EXERCISE_DOCUMENT);
    const html = renderMath(COMPLETE_EXERCISE_DOCUMENT);

    expect(prepared.macros).toMatchObject({
      "\\Carlson": String.raw`\sum_{k=1}^{#1} a_k`,
      "\\R": String.raw`\mathbb{R}`,
    });
    expect(prepared.content).not.toContain("\\documentclass");
    expect(prepared.content).not.toContain("\\begin{document}");
    expect(prepared.content).not.toContain("\\begin{exercise}");
    expect(html).toContain("A sharp Hardy-type inequality");
    expect(html).toContain("Inégalité de Carlson");
    expect(html).toContain("<blockquote>");
    expect(html).toContain("<ol>");
    expect(html).toContain('class="katex-display"');
    expect(html).not.toContain("Equation could not be rendered.");
    expect(html).not.toContain("katex-error");
  });

  it("accepts common theorem, table, bibliography, and matrix structures", () => {
    const document = String.raw`\documentclass{article}
\newtheorem{proposition}{Proposition}
\begin{document}
\begin{proposition}[Matrix identity]
\[
A=\begin{pmatrix}a&b\\c&d\end{pmatrix}
\]
\end{proposition}
\begin{center}
\begin{tabular}{cc}
Name & Value\\
$a_n$ & $n^2$\\
\end{tabular}
\end{center}
\begin{thebibliography}{9}
\bibitem{hardy} G. H. Hardy, \emph{Inequalities}.
\end{thebibliography}
\end{document}`;
    const html = renderMath(document);

    expect(html).toContain("Matrix identity");
    expect(html).toContain('class="mtable"');
    expect(html).toContain("<table>");
    expect(html).toContain("References");
    expect(html).toContain("Inequalities");
    expect(html).not.toContain("Equation could not be rendered.");
  });

  it("does not interpret document commands shown inside fenced code", () => {
    const example = [
      "```latex",
      String.raw`\documentclass{article}`,
      String.raw`\begin{document}`,
      "$x^2$",
      String.raw`\end{document}`,
      "```",
    ].join("\n");

    expect(prepareLatexDocument(example).content).toBe(example);
  });

  it("never truncates a forum preview inside a LaTeX expression", () => {
    const introduction = "This introductory sentence explains the mathematical question clearly. ".repeat(3);
    const expression = String.raw`$$x^{6n+1}+\frac{1}{x^{6n+1}}=S_{6n+1}$$`;
    const content = `${introduction}${expression} More details follow after the equation.`;
    const excerpt = createLatexExcerpt(content, 180);
    const html = renderMath(excerpt, "compact");

    expect(excerpt).not.toContain("$x^{6n");
    expect(excerpt).toMatch(/…$/);
    expect(html).not.toContain("Equation could not be rendered.");
    expect(html).not.toContain("katex-error");
  });

  it("keeps a complete equation and document macros when they fit in the preview", () => {
    const document = String.raw`\documentclass{article}
\newcommand{\Seq}{S_{6n+1}}
\begin{document}
Compute $\Seq=x^{6n+1}+\frac{1}{x^{6n+1}}$ and then provide a detailed proof that continues for many paragraphs.
\end{document}`;
    const excerpt = createLatexExcerpt(document, 105);
    const html = renderMath(excerpt, "compact");

    expect(excerpt).toContain(String.raw`\newcommand{\Seq}`);
    expect(excerpt).toContain(String.raw`$\Seq=x^{6n+1}+\frac{1}{x^{6n+1}}$`);
    expect(firstMathMlFraction(html)).toContain("</msup></mfrac>");
    expect(html).not.toContain("Equation could not be rendered.");
  });

  it("uses the complete topic content instead of a previously broken stored excerpt", () => {
    const forumPage = readFileSync(path.resolve(__dirname, "../components/forum/forum-page-client.tsx"), "utf8");

    expect(forumPage).toContain("createLatexExcerpt(topic.content)");
    expect(forumPage).not.toContain("topic.content.slice(0, 180)");
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

  it.each(MATRIX_ENVIRONMENTS)("renders the matrix or piecewise environment %s", (environment) => {
    const html = renderMath(`$$${environment}$$`);

    expect(html).toContain('class="mtable"');
    expect(html).not.toContain("katex-error");
    expect(html).not.toContain("math-svg-renderer");
  });

  it("renders the main classes of mathematical notation", () => {
    const content = String.raw`
$a_{n_k}^{m+1},\quad \sqrt[n]{x},\quad \binom{n}{k},\quad \left\langle x,y\right\rangle$

$$\int_0^\infty e^{-x^2}\,dx+\sum_{k=1}^n k+\prod_{j=1}^m j+\lim_{x\to0}\frac{\sin x}{x}$$

$\forall x\in\R,\ \exists n\in\N:\ x\leq n\Rightarrow x\in\C\iff x\in\Q\cup\Z$

$\vec v,\ \hat x,\ \overline{AB},\ \underbrace{x+\cdots+x}_{n\text{ terms}},\ \mathcal F,\ \mathbf A,\ \operatorname{rank}(A)$`;
    const html = renderMath(content);

    expect(html).toContain("class=\"katex\"");
    expect(html).toContain("class=\"mfrac\"");
    expect(html).toContain("<mroot>");
    expect(html).not.toContain("katex-error");
    expect(html).not.toContain("math-svg-renderer");
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

  it("routes an unknown KaTeX command to the broader renderer without showing raw commands", () => {
    const html = renderMath(String.raw`$\notARealCommand{x}$`);

    expect(html).toContain("math-svg-renderer");
    expect(html).toContain('data-display="false"');
    expect(html).toContain("Rendering equation");
    expect(html).not.toContain("\\notARealCommand");
    expect(html).not.toContain("katex-error");
  });
});

describe("MathJax and XY-pic fallback rendering", () => {
  it("routes valid MathJax notation that KaTeX does not support", () => {
    const inline = renderMath(String.raw`A boxed value $\bbox[4px,border:1px solid]{x+y}$ is shown.`);
    const display = renderMath(String.raw`\begin{multline}a+b+c\\=d\end{multline}`);

    expect(inline).toContain('class="math-svg-renderer"');
    expect(inline).toContain('data-display="false"');
    expect(display).toContain('class="math-svg-renderer"');
    expect(display).toContain('data-display="true"');
    expect(inline).not.toContain("katex-error");
    expect(display).not.toContain("katex-error");
  });

  it("routes xymatrix source around KaTeX without changing the submitted expression", () => {
    const html = renderMath(`$${REPORTED_XY_MATRIX}$`);

    expect(html).toContain("math-svg-renderer");
    expect(html).toContain('data-display="true"');
    expect(html).toContain("Rendering equation");
    expect(html).not.toContain("Equation could not be rendered.");
    expect(html).not.toContain("katex-error");
  });

  it("renders the exact reported infinite-tree branches as an XyJax SVG", async () => {
    const request = new Request("http://localhost/api/math/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latex: REPORTED_XY_MATRIX, display: true }),
    });
    const response = await renderMathSvg(request);
    const svg = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("image/svg+xml");
    expect(svg).toMatch(/^<svg\b/);
    expect(svg).toContain('data-mml-node="xypic"');
    expect(svg).toContain("</svg>");
    expect(svg).not.toContain('data-mml-node="merror"');
  });

  it("renders a non-KaTeX MathJax command as SVG", async () => {
    const request = new Request("http://localhost/api/math/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latex: String.raw`\bbox[4px,border:1px solid]{x+y}`, display: false }),
    });
    const response = await renderMathSvg(request);
    const svg = await response.text();

    expect(response.status).toBe(200);
    expect(svg).toMatch(/^<svg\b/);
    expect(svg).not.toContain('data-mml-node="merror"');
  });

  it("accepts equation labels commonly found in complete LaTeX documents", async () => {
    const request = new Request("http://localhost/api/math/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latex: String.raw`\begin{equation}x^2=1\label{eq:square}\end{equation}`,
        display: true,
      }),
    });
    const response = await renderMathSvg(request);
    const svg = await response.text();

    expect(response.status).toBe(200);
    expect(svg).toMatch(/^<svg\b/);
    expect(svg).not.toContain('data-mml-node="merror"');
  });

  it("passes safe user-defined macros to the MathJax fallback", async () => {
    const request = new Request("http://localhost/api/math/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latex: String.raw`\bbox[4px,border:1px solid]{\DHL(k,2)}`,
        display: true,
        macros: { "\\DHL": String.raw`\operatorname{DHL}` },
      }),
    });
    const response = await renderMathSvg(request);
    const svg = await response.text();

    expect(response.status).toBe(200);
    expect(svg).toMatch(/^<svg\b/);
    expect(svg).toContain('data-c="44"');
    expect(svg).toContain('data-c="48"');
    expect(svg).toContain('data-c="4C"');
    expect(svg).not.toContain('data-mml-node="merror"');
  });

  it("rejects unsafe commands hidden in user-defined macros", async () => {
    const request = new Request("http://localhost/api/math/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latex: String.raw`\unsafe`,
        display: true,
        macros: { "\\unsafe": String.raw`\input{private-file}` },
      }),
    });
    const response = await renderMathSvg(request);

    expect(response.status).toBe(400);
  });

  it("rejects non-mathematical file commands", async () => {
    const request = new Request("http://localhost/api/math/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latex: String.raw`\input{private-file}`, display: true }),
    });
    const response = await renderMathSvg(request);

    expect(response.status).toBe(400);
  });

  it("returns a controlled error when neither renderer understands the expression", async () => {
    const request = new Request("http://localhost/api/math/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ latex: String.raw`\notARealCommand{x}`, display: false }),
    });
    const response = await renderMathSvg(request);

    expect(response.status).toBe(422);
  });
});
