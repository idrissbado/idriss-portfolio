import { auth } from "@/lib/auth";

export const runtime = "nodejs";

const MAX_PROMPT_LENGTH = 8_000;
const MAX_IMAGE_LENGTH = 9_000_000;
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const DEFAULT_GROQ_MODEL = "meta-llama/llama-4-maverick-17b-128e-instruct";
const RETIRED_GROQ_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";
const DEFAULT_GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_VISION_FALLBACKS = [
  "meta-llama/llama-4-scout-17b-16e-instruct",
  "meta-llama/llama-4-maverick-17b-128e-instruct",
  "llama-3.2-11b-vision-preview",
] as const;

class ProviderError extends Error {
  constructor(public readonly status: number, message: string) {
    super(message);
  }
}

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

function createInstruction(prompt: string) {
  return [
    "Convert the user's mathematical request into accurate LaTeX.",
    "If an image is supplied, transcribe every visible mathematical expression and preserve structure.",
    "Return a concise explanation followed by a fenced latex block.",
    "Use standard LaTeX compatible with KaTeX and MathJax. Do not invent missing symbols; mark uncertain text as [unclear].",
    prompt ? `User request: ${prompt}` : "The user supplied an image without additional instructions.",
  ].join("\n\n");
}

async function callGemini(apiKey: string, model: string, prompt: string, imageDataUrl: string) {
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const parts: Array<Record<string, unknown>> = [{ text: createInstruction(prompt) }];

  if (imageDataUrl) {
    const match = imageDataUrl.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,(.+)$/i);
    if (match) {
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: { temperature: 0.1 },
    }),
  });
  const payload = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: unknown }> } }>;
  };

  if (!response.ok) {
    console.error("Gemini provider error:", response.status);
    throw new Error("Gemini provider request failed.");
  }

  return payload.candidates?.[0]?.content?.parts?.map((part) => String(part.text ?? "")).join("\n").trim() ?? "";
}

async function callOpenAiCompatible(apiKey: string, endpoint: string, model: string, prompt: string, imageDataUrl: string) {
  const userContent = [
    { type: "text", text: createInstruction(prompt) },
    ...(imageDataUrl ? [{ type: "image_url", image_url: { url: imageDataUrl, detail: "high" } }] : []),
  ];
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      temperature: 0.1,
      messages: [
        { role: "system", content: "You are a mathematical LaTeX recognition assistant. Be exact, concise, and honest about uncertainty." },
        { role: "user", content: userContent },
      ],
    }),
  });
  const payload = (await response.json()) as {
    error?: { message?: unknown; type?: unknown; code?: unknown };
    choices?: Array<{ finish_reason?: unknown }>;
  };
  if (!response.ok) {
    const providerMessage = typeof payload.error?.message === "string" ? payload.error.message : "Unknown provider error.";
    console.error("Groq provider error:", { status: response.status, model, message: providerMessage });
    throw new ProviderError(response.status, providerMessage);
  }
  const result = extractAssistantText(payload);
  if (!result) {
    const finishReason = String(payload.choices?.[0]?.finish_reason ?? "unknown");
    throw new ProviderError(502, `Groq returned no text (finish_reason: ${finishReason}).`);
  }

  return result;
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

  const geminiApiKey = process.env.GEMINI_API_KEY;
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey && !geminiApiKey) {
    return jsonError("Configure GROQ_API_KEY in Vercel to enable the free AI assistant.", 503);
  }

  try {
    const configuredGroqModel = process.env.GROQ_MODEL || DEFAULT_GROQ_MODEL;
    const groqModel = configuredGroqModel === RETIRED_GROQ_MODEL ? DEFAULT_GROQ_MODEL : configuredGroqModel;
    let result = "";

    if (groqApiKey) {
      try {
        result = await callOpenAiCompatible(groqApiKey, process.env.GROQ_API_URL || DEFAULT_GROQ_ENDPOINT, groqModel, prompt, imageDataUrl);
      } catch (initialError) {
        if (!(initialError instanceof ProviderError) || ![404, 502].includes(initialError.status)) throw initialError;
      }
    } else if (geminiApiKey) {
      result = await callGemini(geminiApiKey, process.env.GEMINI_MODEL || DEFAULT_GEMINI_MODEL, prompt, imageDataUrl);
    }

    if (groqApiKey && !result) {
      for (const fallbackModel of GROQ_VISION_FALLBACKS) {
        if (fallbackModel === groqModel) continue;
        try {
          result = await callOpenAiCompatible(groqApiKey, process.env.GROQ_API_URL || DEFAULT_GROQ_ENDPOINT, fallbackModel, prompt, imageDataUrl);
          if (result) break;
        } catch (fallbackError) {
          if (!(fallbackError instanceof ProviderError) || ![404, 502].includes(fallbackError.status)) throw fallbackError;
        }
      }
    }
    if (!result) {
      return jsonError("The AI provider returned an empty result.", 502);
    }

    return Response.json({ result, latex: extractLatex(result) });
  } catch (error) {
    const message = error instanceof ProviderError && error.status === 404
      ? "No accessible Groq vision model was found. Choose a vision model available in Groq Console or add GEMINI_API_KEY."
      : error instanceof Error ? `Groq ${error.message}` : "Unknown Groq error.";
    return jsonError(message.slice(0, 300), 502);
  }
}
