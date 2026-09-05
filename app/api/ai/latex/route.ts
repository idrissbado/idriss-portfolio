import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_PROMPT_LENGTH = 8_000;
const MAX_IMAGE_LENGTH = 9_000_000;
const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_ENDPOINT = "https://api.openai.com/v1/chat/completions";

function jsonError(message: string, status: number) {
  return Response.json({ error: message }, { status });
}

function extractAssistantText(payload: unknown) {
  const content = (payload as { choices?: Array<{ message?: { content?: unknown } }> })?.choices?.[0]?.message?.content;

  if (typeof content === "string") {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((part) => (typeof part === "object" && part !== null && "text" in part ? String(part.text ?? "") : ""))
      .join("\n")
      .trim();
  }

  return "";
}

function extractLatex(text: string) {
  const fenced = text.match(/```(?:latex|tex)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  if (fenced) {
    return fenced;
  }

  const display = text.match(/(\\begin\{[\s\S]+|\\\[[\s\S]+|\$\$[\s\S]+\$\$)/)?.[1]?.trim();
  return display || text;
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return jsonError("Please log in to use the AI LaTeX assistant.", 401);
  }

  let body: { prompt?: unknown; imageDataUrl?: unknown };
  try {
    body = (await request.json()) as { prompt?: unknown; imageDataUrl?: unknown };
  } catch {
    return jsonError("A JSON body is required.", 400);
  }

  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const imageDataUrl = typeof body.imageDataUrl === "string" ? body.imageDataUrl.trim() : "";

  if (!prompt && !imageDataUrl) {
    return jsonError("Add a description or an image to generate LaTeX.", 400);
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return jsonError("The description is too long.", 413);
  }

  if (imageDataUrl && (!/^data:image\/(?:png|jpeg|jpg|webp);base64,/i.test(imageDataUrl) || imageDataUrl.length > MAX_IMAGE_LENGTH)) {
    return jsonError("Please upload a PNG, JPEG, or WebP image smaller than 6 MB.", 400);
  }

  const apiKey = process.env.OPENPRISM_LLM_API_KEY || process.env.OPENAI_API_KEY;
  const endpoint = process.env.OPENPRISM_LLM_ENDPOINT || process.env.OPENAI_API_URL || DEFAULT_ENDPOINT;
  const model = process.env.OPENPRISM_LLM_MODEL || process.env.OPENAI_MODEL || DEFAULT_MODEL;

  if (!apiKey) {
    return jsonError("The OpenPrism AI provider is not configured on the server.", 503);
  }

  const userContent = [
    {
      type: "text",
      text: [
        "Convert the user's mathematical request into accurate LaTeX.",
        "If an image is supplied, transcribe every visible mathematical expression and preserve structure.",
        "Return a concise explanation followed by a fenced latex block.",
        "Use standard LaTeX compatible with KaTeX and MathJax. Do not invent missing symbols; mark uncertain text as [unclear].",
        prompt ? `User request: ${prompt}` : "The user supplied an image without additional instructions.",
      ].join("\n\n"),
    },
    ...(imageDataUrl ? [{ type: "image_url", image_url: { url: imageDataUrl, detail: "high" } }] : []),
  ];

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content: "You are OpenPrism's mathematical LaTeX recognition assistant. Be exact, concise, and honest about uncertainty.",
          },
          { role: "user", content: userContent },
        ],
      }),
    });

    const payload = (await response.json()) as unknown;
    if (!response.ok) {
      console.error("OpenPrism provider error:", response.status, payload);
      return jsonError("The OpenPrism AI provider could not process this request.", 502);
    }

    const result = extractAssistantText(payload);
    if (!result) {
      return jsonError("The AI provider returned an empty result.", 502);
    }

    return Response.json({ result, latex: extractLatex(result) });
  } catch (error) {
    console.error("OpenPrism LaTeX request failed:", error);
    return jsonError("The OpenPrism AI provider is temporarily unavailable.", 502);
  }
}
