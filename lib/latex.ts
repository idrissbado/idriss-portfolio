const DISPLAY_ENVIRONMENTS = new Set([
  "equation",
  "equation*",
  "align",
  "align*",
  "aligned",
  "alignedat",
  "gather",
  "gather*",
  "gathered",
  "cases",
  "matrix",
  "pmatrix",
  "bmatrix",
  "Bmatrix",
  "vmatrix",
  "Vmatrix",
  "smallmatrix",
  "array",
]);

type LatexNormalizationOptions = {
  /** Keep every math expression inline, as required by question titles. */
  inlineOnly?: boolean;
};

type EnvironmentToken = {
  end: number;
  kind: "begin" | "end";
  name: string;
};

function isEscaped(content: string, index: number) {
  let slashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && content[cursor] === "\\"; cursor -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function readEnvironmentToken(content: string, index: number): EnvironmentToken | null {
  if (content[index] !== "\\" || isEscaped(content, index)) {
    return null;
  }

  const kind = content.startsWith("\\begin{", index)
    ? "begin"
    : content.startsWith("\\end{", index)
      ? "end"
      : null;

  if (!kind) {
    return null;
  }

  const nameStart = index + (kind === "begin" ? "\\begin{".length : "\\end{".length);
  const nameEnd = content.indexOf("}", nameStart);

  if (nameEnd === -1) {
    return null;
  }

  const name = content.slice(nameStart, nameEnd);
  if (!DISPLAY_ENVIRONMENTS.has(name)) {
    return null;
  }

  return { end: nameEnd + 1, kind, name };
}

function findEnvironmentEnd(content: string, opening: EnvironmentToken) {
  const stack = [opening.name];

  for (let cursor = opening.end; cursor < content.length; cursor += 1) {
    const token = readEnvironmentToken(content, cursor);
    if (!token) {
      continue;
    }

    if (token.kind === "begin") {
      stack.push(token.name);
    } else if (stack.at(-1) === token.name) {
      stack.pop();
      if (stack.length === 0) {
        return token.end;
      }
    }

    cursor = token.end - 1;
  }

  return null;
}

function trimHorizontalWhitespaceEnd(content: string) {
  let end = content.length;
  while (end > 0 && (content[end - 1] === " " || content[end - 1] === "\t")) {
    end -= 1;
  }
  return content.slice(0, end);
}

/**
 * Converts only delimiter tokens outside Markdown code. The mathematical
 * payload between delimiters is copied verbatim; braces, backslashes, and
 * command structure are never parsed or rewritten here.
 */
function normalizeAlternativeDelimiters(content: string, inlineOnly: boolean) {
  let result = "";
  let inlineCodeTicks = 0;
  let dollarMode: "inline" | "display" | null = null;

  for (let index = 0; index < content.length;) {
    if (content[index] === "\n") {
      result += content[index];
      index += 1;
      continue;
    }

    if (content[index] === "`" && dollarMode === null) {
      let tickCount = 1;
      while (content[index + tickCount] === "`") {
        tickCount += 1;
      }

      if (inlineCodeTicks === 0) {
        inlineCodeTicks = tickCount;
      } else if (inlineCodeTicks === tickCount) {
        inlineCodeTicks = 0;
      }

      result += "`".repeat(tickCount);
      index += tickCount;
      continue;
    }

    if (inlineCodeTicks === 0 && content[index] === "$" && !isEscaped(content, index)) {
      const nextMode = content[index + 1] === "$" ? "display" : "inline";
      const delimiterLength = nextMode === "display" ? 2 : 1;

      if (dollarMode === null) {
        dollarMode = nextMode;
      } else if (dollarMode === nextMode) {
        dollarMode = null;
      }

      result += "$".repeat(delimiterLength);
      index += delimiterLength;
      continue;
    }

    if (inlineCodeTicks === 0 && dollarMode === null && content[index] === "\\" && !isEscaped(content, index)) {
      const delimiter = content[index + 1];

      if (delimiter === "(" || delimiter === ")") {
        result += "$";
        index += 2;
        continue;
      }

      if (delimiter === "[" || delimiter === "]") {
        result += inlineOnly ? "$" : "\n$$\n";
        index += 2;
        continue;
      }
    }

    result += content[index];
    index += 1;
  }

  return result;
}

function normalizeDollarDelimiters(content: string, inlineOnly: boolean) {
  let result = "";
  let inlineCodeTicks = 0;
  let displayMathOpen = false;
  let inlineMathOpen = false;

  for (let index = 0; index < content.length;) {
    if (content[index] === "\n") {
      result += content[index];
      index += 1;
      continue;
    }

    if (content[index] === "`" && !displayMathOpen && !inlineMathOpen) {
      let tickCount = 1;
      while (content[index + tickCount] === "`") {
        tickCount += 1;
      }

      if (inlineCodeTicks === 0) {
        inlineCodeTicks = tickCount;
      } else if (inlineCodeTicks === tickCount) {
        inlineCodeTicks = 0;
      }

      result += "`".repeat(tickCount);
      index += tickCount;
      continue;
    }

    const isSingleDollar =
      inlineCodeTicks === 0 &&
      !displayMathOpen &&
      content[index] === "$" &&
      content[index + 1] !== "$" &&
      !isEscaped(content, index);

    if (isSingleDollar) {
      inlineMathOpen = !inlineMathOpen;
      result += "$";
      index += 1;
      continue;
    }

    const isDoubleDollar =
      inlineCodeTicks === 0 &&
      !inlineMathOpen &&
      content[index] === "$" &&
      content[index + 1] === "$" &&
      !isEscaped(content, index);

    if (!isDoubleDollar) {
      result += content[index];
      index += 1;
      continue;
    }

    if (inlineOnly) {
      result += "$";
      index += 2;
      continue;
    }

    const lineStart = content.lastIndexOf("\n", index - 1) + 1;
    const nextLineBreak = content.indexOf("\n", index + 2);
    const lineEnd = nextLineBreak === -1 ? content.length : nextLineBreak;
    const isOnOwnLine =
      content.slice(lineStart, index).trim() === "" &&
      content.slice(index + 2, lineEnd).trim() === "";

    if (isOnOwnLine) {
      result += "$$";
      displayMathOpen = !displayMathOpen;
      index += 2;
      continue;
    }

    if (displayMathOpen) {
      if (!result.endsWith("\n")) {
        result += "\n";
      }
      result += "$$\n\n";
    } else {
      result = trimHorizontalWhitespaceEnd(result);
      if (result.length > 0 && !result.endsWith("\n\n")) {
        result += result.endsWith("\n") ? "\n" : "\n\n";
      }
      result += "$$\n";
    }

    displayMathOpen = !displayMathOpen;
    index += 2;
  }

  return result;
}

function wrapStandaloneEnvironments(content: string, inlineOnly: boolean) {
  let result = "";
  let cursor = 0;
  let inlineCodeTicks = 0;
  let dollarMode: "inline" | "display" | null = null;

  while (cursor < content.length) {
    if (content[cursor] === "\n") {
      result += content[cursor];
      cursor += 1;
      continue;
    }

    if (content[cursor] === "`" && dollarMode === null) {
      let tickCount = 1;
      while (content[cursor + tickCount] === "`") {
        tickCount += 1;
      }

      if (inlineCodeTicks === 0) {
        inlineCodeTicks = tickCount;
      } else if (inlineCodeTicks === tickCount) {
        inlineCodeTicks = 0;
      }

      result += "`".repeat(tickCount);
      cursor += tickCount;
      continue;
    }

    if (inlineCodeTicks === 0 && content[cursor] === "$" && !isEscaped(content, cursor)) {
      const nextMode = content[cursor + 1] === "$" ? "display" : "inline";
      const delimiterLength = nextMode === "display" ? 2 : 1;

      if (dollarMode === null) {
        dollarMode = nextMode;
      } else if (dollarMode === nextMode) {
        dollarMode = null;
      }

      result += "$".repeat(delimiterLength);
      cursor += delimiterLength;
      continue;
    }

    if (inlineCodeTicks === 0 && dollarMode === null) {
      const opening = readEnvironmentToken(content, cursor);
      if (opening?.kind === "begin") {
        const environmentEnd = findEnvironmentEnd(content, opening);
        if (environmentEnd !== null) {
          const environment = content.slice(cursor, environmentEnd);
          result += inlineOnly ? `$${environment}$` : `\n\n$$\n${environment}\n$$\n\n`;
          cursor = environmentEnd;
          continue;
        }
      }
    }

    result += content[cursor];
    cursor += 1;
  }

  return result;
}

function normalizeOutsideFencedCode(content: string, inlineOnly: boolean) {
  const parts = content.split(/(?<=\n)/);
  let activeFence: { marker: string; length: number } | null = null;
  let pendingText = "";
  let result = "";

  const flushPendingText = () => {
    const alternativeDelimiters = normalizeAlternativeDelimiters(pendingText, inlineOnly);
    const dollarDelimiters = normalizeDollarDelimiters(alternativeDelimiters, inlineOnly);
    result += wrapStandaloneEnvironments(dollarDelimiters, inlineOnly);
    pendingText = "";
  };

  for (const part of parts) {
    const fenceMatch = part.match(/^\s*(`{3,}|~{3,})/);

    if (!fenceMatch) {
      if (activeFence) {
        result += part;
      } else {
        pendingText += part;
      }
      continue;
    }

    const fence = fenceMatch[1];
    const marker = fence[0];

    if (!activeFence) {
      flushPendingText();
      activeFence = { marker, length: fence.length };
      result += part;
      continue;
    }

    result += part;
    if (activeFence.marker === marker && fence.length >= activeFence.length) {
      activeFence = null;
    }
  }

  flushPendingText();
  return result;
}

/**
 * Supports `$...$`, `$$...$$`, `\\(...\\)`, `\\[...\\]`, and common
 * LaTeX environments in Markdown. Only the outer delimiters are normalized;
 * every character in the mathematical expression itself is preserved.
 */
export function normalizeLatexDelimiters(content: string, options: LatexNormalizationOptions = {}) {
  return normalizeOutsideFencedCode(content, options.inlineOnly ?? false);
}
