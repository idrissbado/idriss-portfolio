"use client";

import { useEffect, useState } from "react";

type MathSvgRendererProps = {
  latex: string;
  display?: boolean;
  macros?: Record<string, string>;
};

type RenderState =
  | { status: "loading" }
  | { status: "ready"; url: string }
  | { status: "error" };

export function MathSvgRenderer({ latex, display = true, macros = {} }: MathSvgRendererProps) {
  const [state, setState] = useState<RenderState>({ status: "loading" });
  const requestBody = JSON.stringify({ latex, display, macros });

  useEffect(() => {
    const controller = new AbortController();
    let objectUrl: string | undefined;

    async function renderEquation() {
      setState({ status: "loading" });

      try {
        const response = await fetch("/api/math/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: requestBody,
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error("The LaTeX expression could not be rendered.");
        }

        const svg = await response.blob();
        objectUrl = URL.createObjectURL(svg);
        setState({ status: "ready", url: objectUrl });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        console.error("MathJax rendering failed", error);
        setState({ status: "error" });
      }
    }

    void renderEquation();

    return () => {
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [requestBody]);

  return (
    <span className="math-svg-renderer" data-display={display ? "true" : "false"}>
      {state.status === "loading" ? (
        <span className="math-svg-status" role="status">
          Rendering equation…
        </span>
      ) : null}
      {state.status === "error" ? (
        <span className="math-render-error" role="status">
          Equation could not be rendered.
        </span>
      ) : null}
      {state.status === "ready" ? (
        // The generated SVG is loaded as an image rather than injected into
        // the DOM, keeping user-authored LaTeX isolated from active HTML.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={state.url} alt="Rendered LaTeX mathematical expression" draggable={false} />
      ) : null}
    </span>
  );
}
