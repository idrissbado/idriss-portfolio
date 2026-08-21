const LATEX_DELIMITERS: Record<string, string> = {
  "(": "$",
  ")": "$",
  "[": "\n$$\n",
  "]": "\n$$\n",
};

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

  return content
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
}
