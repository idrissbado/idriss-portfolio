const LATEX_DELIMITERS: Record<string, string> = {
  "(": "$",
  ")": "$",
  "[": "\n$$\n",
  "]": "\n$$\n",
};

const DISPLAY_ENVIRONMENT_PATTERN = /\\begin\{(equation\*?|align\*?|gather\*?|aligned|alignedat|gathered|cases|matrix|pmatrix|bmatrix|Bmatrix|vmatrix|Vmatrix|smallmatrix|array)\}[\s\S]*?\\end\{\1\}/g;

function isEscaped(content: string, index: number) {
  let slashCount = 0;

  for (let cursor = index - 1; cursor >= 0 && content[cursor] === "\\"; cursor -= 1) {
    slashCount += 1;
  }

  return slashCount % 2 === 1;
}

function isInsideInlineCode(content: string, index: number) {
  const lineStart = content.lastIndexOf("\n", index - 1) + 1;
  let activeTicks = 0;

  for (let cursor = lineStart; cursor < index;) {
    if (content[cursor] !== "`") {
      cursor += 1;
      continue;
    }

    let tickCount = 1;
    while (content[cursor + tickCount] === "`") {
      tickCount += 1;
    }

    if (activeTicks === 0) {
      activeTicks = tickCount;
    } else if (activeTicks === tickCount) {
      activeTicks = 0;
    }

    cursor += tickCount;
  }

  return activeTicks > 0;
}

function isInsideDollarMath(content: string, index: number) {
  let mode: "inline" | "display" | null = null;

  for (let cursor = 0; cursor < index;) {
    if (content[cursor] !== "$" || isEscaped(content, cursor)) {
      cursor += 1;
      continue;
    }

    const delimiter = content[cursor + 1] === "$" ? "display" : "inline";
    const delimiterLength = delimiter === "display" ? 2 : 1;

    if (mode === null) {
      mode = delimiter;
    } else if (mode === delimiter) {
      mode = null;
    }

    cursor += delimiterLength;
  }

  return mode !== null;
}

function wrapLatexEnvironments(content: string) {
  return content.replace(DISPLAY_ENVIRONMENT_PATTERN, (match, _environment: string, offset: number) => {
    if (isEscaped(content, offset) || isInsideInlineCode(content, offset) || isInsideDollarMath(content, offset)) {
      return match;
    }

    return `\n\n$$\n${match.trim()}\n$$\n\n`;
  });
}

function normalizeDisplayDollarDelimiters(content: string) {
  let result = "";
  let inlineCodeTicks = 0;
  let displayMathOpen = false;

  for (let index = 0; index < content.length;) {
    if (content[index] === "\n") {
      result += content[index];
      inlineCodeTicks = 0;
      index += 1;
      continue;
    }

    if (content[index] === "`") {
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

    const isDisplayDelimiter =
      inlineCodeTicks === 0 &&
      content[index] === "$" &&
      content[index + 1] === "$" &&
      !isEscaped(content, index);

    if (!isDisplayDelimiter) {
      result += content[index];
      index += 1;
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

    result = result.replace(/[ \t]+$/, "");

    if (displayMathOpen) {
      if (!result.endsWith("\n")) {
        result += "\n";
      }
      result += "$$\n\n";
    } else {
      if (result.length > 0 && !result.endsWith("\n\n")) {
        result += result.endsWith("\n") ? "\n" : "\n\n";
      }
      result += "$$\n";
    }

    displayMathOpen = !displayMathOpen;
    index += 2;

    while (content[index] === " " || content[index] === "\t") {
      index += 1;
    }
  }

  return result;
}

function normalizeOutsideFencedCode(content: string) {
  const parts = content.split(/(?<=\n)/);
  let activeFence: { marker: string; length: number } | null = null;
  let pendingText = "";
  let result = "";

  const flushPendingText = () => {
    result += wrapLatexEnvironments(normalizeDisplayDollarDelimiters(pendingText));
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

function normalizeLine(line: string) {
  let result = "";
  let inlineCodeTicks = 0;

  for (let index = 0; index < line.length;) {
    if (line[index] === "`") {
      let tickCount = 1;

      while (line[index + tickCount] === "`") {
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

    if (inlineCodeTicks === 0 && line[index] === "\\") {
      let slashCount = 1;

      while (line[index + slashCount] === "\\") {
        slashCount += 1;
      }

      const delimiter = line[index + slashCount];
      const replacement = delimiter ? LATEX_DELIMITERS[delimiter] : undefined;

      if (replacement && slashCount % 2 === 1) {
        result += "\\".repeat(slashCount - 1) + replacement;
        index += slashCount + 1;
        continue;
      }

      result += "\\".repeat(slashCount);
      index += slashCount;
      continue;
    }

    result += line[index];
    index += 1;
  }

  return result;
}

/**
 * Supports the common LaTeX delimiters \(...\) and \[...\] in Markdown while
 * preserving inline code and fenced code examples exactly as they were typed.
 */
export function normalizeLatexDelimiters(content: string) {
  let activeFence: { marker: string; length: number } | null = null;

  const normalizedDelimiters = content
    .split(/(\r?\n)/)
    .map((part) => {
      if (part === "\n" || part === "\r\n") {
        return part;
      }

      const fenceMatch = part.match(/^\s*(`{3,}|~{3,})/);

      if (fenceMatch) {
        const fence = fenceMatch[1];
        const marker = fence[0];

        if (!activeFence) {
          activeFence = { marker, length: fence.length };
        } else if (activeFence.marker === marker && fence.length >= activeFence.length) {
          activeFence = null;
        }

        return part;
      }

      return activeFence ? part : normalizeLine(part);
    })
    .join("");

  return normalizeOutsideFencedCode(normalizedDelimiters);
}
