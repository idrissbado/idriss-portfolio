import { createHash } from "node:crypto";
import { tex2svgHtml } from "mathxyjax3";

export const runtime = "nodejs";

const MAX_LATEX_LENGTH = 8_000;
const MAX_CACHE_ENTRIES = 64;
const svgCache = new Map<string, string>();

class InvalidLatexError extends Error {}

// Rendering is deliberately limited to mathematical TeX. Commands that can
// reference external resources, files, or active HTML are never needed for a
// forum equation and are rejected before MathJax sees the source.
const FORBIDDEN_COMMANDS = [
  "\\documentclass",
  "\\usepackage",
  "\\input",
  "\\include",
  "\\includegraphics",
  "\\openin",
  "\\openout",
  "\\read",
  "\\write",
  "\\special",
  "\\href",
  "\\url",
  "\\require",
  "\\htmlId",
  "\\htmlClass",
  "\\htmlStyle",
  "\\htmlData",
];

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function extractSvg(html: string) {
  const start = html.indexOf("<svg");
  const closingTag = "</svg>";
  const end = html.lastIndexOf(closingTag);

  if (start < 0 || end < start) {
    throw new InvalidLatexError("MathJax did not produce a valid SVG expression.");
  }

  const svg = html.slice(start, end + closingTag.length);

  const hasMathJaxError =
    svg.includes('data-mml-node="merror"') ||
    svg.includes('data-mml-node="mtext" fill="red" stroke="red"');

  if (hasMathJaxError) {
    throw new InvalidLatexError("MathJax returned a mathematical rendering error.");
  }

  return svg;
}

function rememberSvg(key: string, svg: string) {
  if (svgCache.size >= MAX_CACHE_ENTRIES) {
    const oldestKey = svgCache.keys().next().value;
    if (oldestKey) {
      svgCache.delete(oldestKey);
    }
  }

  svgCache.set(key, svg);
}

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return jsonError("A JSON body is required.", 400);
  }

  const body = typeof payload === "object" && payload !== null ? payload : undefined;
  const latex = body && "latex" in body ? (body as { latex?: unknown }).latex : undefined;
  const display = body && "display" in body ? (body as { display?: unknown }).display : true;

  if (typeof latex !== "string" || !latex.trim()) {
    return jsonError("A LaTeX expression is required.", 400);
  }

  if (typeof display !== "boolean") {
    return jsonError("The display option must be a boolean.", 400);
  }

  if (latex.length > MAX_LATEX_LENGTH) {
    return jsonError("The LaTeX expression is too long.", 413);
  }

  if (FORBIDDEN_COMMANDS.some((command) => latex.includes(command))) {
    return jsonError("File, external-link, and active-HTML commands are not allowed.", 400);
  }

  const cacheKey = createHash("sha256").update(`${display ? "1" : "0"}\0${latex}`).digest("hex");
  let svg = svgCache.get(cacheKey);

  try {
    if (!svg) {
      // The mathematical source reaches MathJax unchanged. Only its generated
      // HTML wrapper is removed so the resulting SVG can be served as an
      // isolated, non-interactive image.
      svg = extractSvg(tex2svgHtml(latex, { display, em: 16, ex: 8 }));
      rememberSvg(cacheKey, svg);
    }
  } catch (error) {
    if (!(error instanceof InvalidLatexError)) {
      console.error("MathJax failed to render an expression", error);
    }
    return jsonError("The LaTeX expression could not be rendered.", 422);
  }

  return new Response(svg, {
    headers: {
      "Cache-Control": "private, max-age=86400",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox",
      "Content-Type": "image/svg+xml; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
