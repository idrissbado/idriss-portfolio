import { renderToStaticMarkup } from "react-dom/server";
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
    const markdown = "`\\(inline example\\)`\n\n```tex\n\\[display example\\]\n```";

    expect(normalizeLatexDelimiters(markdown)).toBe(markdown);
  });

  it("renders inline and display equations with KaTeX", () => {
    const html = renderToStaticMarkup(
      <MathRenderer content={"Inline \\(x^2\\)\n\n\\[\\sum_{n=1}^{\\infty} n^{-2}\\]"} />,
    );

    expect(html).toContain("class=\"katex\"");
    expect(html).toContain("class=\"katex-display\"");
    expect(html).toContain("math-content");
  });
});
