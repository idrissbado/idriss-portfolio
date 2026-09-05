import { isMathEnvironment } from "@/lib/latex-environments";

const MAX_MACROS = 64;
const MAX_MACRO_DEFINITION_LENGTH = 2_000;

const DEFAULT_THEOREM_NAMES: Record<string, string> = {
  axiom: "Axiom",
  claim: "Claim",
  conjecture: "Conjecture",
  corollary: "Corollary",
  definition: "Definition",
  example: "Example",
  exercise: "Exercise",
  lemma: "Lemma",
  notation: "Notation",
  problem: "Problem",
  proposition: "Proposition",
  remark: "Remark",
  solution: "Solution",
  theorem: "Theorem",
  warning: "Warning",
};

const UNWRAPPED_ENVIRONMENTS = new Set([
  "center",
  "flushleft",
  "flushright",
  "figure",
  "figure*",
  "table",
  "table*",
  "minipage",
  "small",
  "footnotesize",
  "scriptsize",
  "large",
  "Large",
  "LARGE",
]);

const VERBATIM_ENVIRONMENTS = new Set(["verbatim", "Verbatim", "lstlisting", "minted"]);

type ParsedGroup = {
  end: number;
  value: string;
};

type ControlSequence = {
  end: number;
  name: string;
  star: boolean;
};

type EnvironmentToken = {
  end: number;
  kind: "begin" | "end";
  name: string;
  start: number;
};

type LatexMetadata = {
  author?: string;
  date?: string;
  title?: string;
};

type LatexDeclarations = {
  macros: Record<string, string>;
  metadata: LatexMetadata;
  theoremNames: Record<string, string>;
};

type TransformContext = LatexDeclarations;

export type PreparedLatexDocument = {
  content: string;
  macros: Record<string, string>;
};

function isEscaped(content: string, index: number) {
  let slashCount = 0;
  for (let cursor = index - 1; cursor >= 0 && content[cursor] === "\\"; cursor -= 1) {
    slashCount += 1;
  }
  return slashCount % 2 === 1;
}

function skipWhitespace(content: string, index: number) {
  let cursor = index;
  while (/\s/.test(content[cursor] ?? "")) {
    cursor += 1;
  }
  return cursor;
}

function readBalancedGroup(content: string, index: number, opening = "{", closing = "}"): ParsedGroup | null {
  if (content[index] !== opening) {
    return null;
  }

  let depth = 1;
  for (let cursor = index + 1; cursor < content.length; cursor += 1) {
    if (content[cursor] === opening && !isEscaped(content, cursor)) {
      depth += 1;
    } else if (content[cursor] === closing && !isEscaped(content, cursor)) {
      depth -= 1;
      if (depth === 0) {
        return { end: cursor + 1, value: content.slice(index + 1, cursor) };
      }
    }
  }

  return null;
}

function readRequiredArgument(content: string, index: number) {
  return readBalancedGroup(content, skipWhitespace(content, index));
}

function readOptionalArgument(content: string, index: number) {
  return readBalancedGroup(content, skipWhitespace(content, index), "[", "]");
}

function readControlSequence(content: string, index: number): ControlSequence | null {
  if (content[index] !== "\\") {
    return null;
  }

  let cursor = index + 1;
  if (/[A-Za-z@]/.test(content[cursor] ?? "")) {
    while (/[A-Za-z@]/.test(content[cursor] ?? "")) {
      cursor += 1;
    }
  } else if (cursor < content.length) {
    cursor += 1;
  }

  const name = content.slice(index, cursor);
  const star = content[cursor] === "*";
  return { end: star ? cursor + 1 : cursor, name, star };
}

function readEnvironmentToken(content: string, index: number): EnvironmentToken | null {
  if (content[index] !== "\\" || isEscaped(content, index)) {
    return null;
  }

  const kind = content.startsWith("\\begin", index)
    ? "begin"
    : content.startsWith("\\end", index)
      ? "end"
      : null;

  if (!kind) {
    return null;
  }

  const commandEnd = index + (kind === "begin" ? "\\begin".length : "\\end".length);
  const name = readRequiredArgument(content, commandEnd);
  if (!name) {
    return null;
  }

  return { end: name.end, kind, name: name.value.trim(), start: index };
}

function findMatchingEnvironment(content: string, opening: EnvironmentToken) {
  let depth = 1;

  for (let cursor = opening.end; cursor < content.length; cursor += 1) {
    const token = readEnvironmentToken(content, cursor);
    if (!token || token.name !== opening.name) {
      continue;
    }

    depth += token.kind === "begin" ? 1 : -1;
    if (depth === 0) {
      return token;
    }
    cursor = token.end - 1;
  }

  return null;
}

function maskFencedCode(content: string) {
  let activeFence: { length: number; marker: string } | null = null;
  let result = "";
  let lineStart = 0;

  while (lineStart < content.length) {
    const newline = content.indexOf("\n", lineStart);
    const lineEnd = newline === -1 ? content.length : newline + 1;
    const line = content.slice(lineStart, lineEnd);
    const fence = line.match(/^\s*(`{3,}|~{3,})/)?.[1];
    const wasInsideFence = activeFence !== null;

    if (fence) {
      const marker = fence[0];
      if (!activeFence) {
        activeFence = { length: fence.length, marker };
      } else if (activeFence.marker === marker && fence.length >= activeFence.length) {
        activeFence = null;
      }
    }

    const shouldMask = wasInsideFence || Boolean(fence);
    result += shouldMask ? line.replace(/[^\n]/g, " ") : line;
    lineStart = lineEnd;
  }

  return result;
}

function findEnvironment(content: string, name: string, kind: "begin" | "end", from = 0) {
  const searchable = maskFencedCode(content);
  for (let cursor = from; cursor < searchable.length; cursor += 1) {
    const token = readEnvironmentToken(searchable, cursor);
    if (token?.name === name && token.kind === kind) {
      return readEnvironmentToken(content, cursor);
    }
  }
  return null;
}

function parseNewCommand(content: string, index: number) {
  const command = readControlSequence(content, index);
  if (!command || !["\\newcommand", "\\renewcommand", "\\providecommand"].includes(command.name)) {
    return null;
  }

  let cursor = skipWhitespace(content, command.end);
  const nameGroup = readBalancedGroup(content, cursor);
  let macroName: string;

  if (nameGroup) {
    macroName = nameGroup.value.trim();
    cursor = nameGroup.end;
  } else {
    const directName = readControlSequence(content, cursor);
    if (!directName) {
      return null;
    }
    macroName = directName.name;
    cursor = directName.end;
  }

  if (!/^\\[A-Za-z@]+$/.test(macroName)) {
    return null;
  }

  const argumentCount = readOptionalArgument(content, cursor);
  if (argumentCount) {
    cursor = argumentCount.end;
    const optionalDefault = readOptionalArgument(content, cursor);
    if (optionalDefault) {
      cursor = optionalDefault.end;
    }
  }

  const definition = readRequiredArgument(content, cursor);
  if (!definition) {
    return null;
  }

  return {
    definition: definition.value,
    end: definition.end,
    name: macroName,
  };
}

function parseNewTheorem(content: string, index: number) {
  const command = readControlSequence(content, index);
  if (command?.name !== "\\newtheorem") {
    return null;
  }

  const environment = readRequiredArgument(content, command.end);
  if (!environment) {
    return null;
  }

  let cursor = environment.end;
  const sharedCounter = readOptionalArgument(content, cursor);
  if (sharedCounter) {
    cursor = sharedCounter.end;
  }

  const displayName = readRequiredArgument(content, cursor);
  if (!displayName) {
    return null;
  }

  cursor = displayName.end;
  const numberedWithin = readOptionalArgument(content, cursor);
  if (numberedWithin) {
    cursor = numberedWithin.end;
  }

  return {
    displayName: displayName.value.trim(),
    end: cursor,
    environment: environment.value.trim(),
  };
}

function parseMetadataCommand(content: string, index: number) {
  const command = readControlSequence(content, index);
  if (!command || !["\\title", "\\author", "\\date"].includes(command.name)) {
    return null;
  }

  const argument = readRequiredArgument(content, command.end);
  if (!argument) {
    return null;
  }

  return {
    end: argument.end,
    key: command.name.slice(1) as keyof LatexMetadata,
    value: argument.value,
  };
}

function collectDeclarations(content: string): LatexDeclarations {
  const searchable = maskFencedCode(content);
  const declarations: LatexDeclarations = {
    macros: {},
    metadata: {},
    theoremNames: { ...DEFAULT_THEOREM_NAMES },
  };

  for (let cursor = 0; cursor < searchable.length; cursor += 1) {
    if (searchable[cursor] !== "\\") {
      continue;
    }

    const macro = parseNewCommand(content, cursor);
    if (macro) {
      if (
        Object.keys(declarations.macros).length < MAX_MACROS &&
        macro.definition.length <= MAX_MACRO_DEFINITION_LENGTH
      ) {
        declarations.macros[macro.name] = macro.definition;
      }
      cursor = macro.end - 1;
      continue;
    }

    const theorem = parseNewTheorem(content, cursor);
    if (theorem) {
      declarations.theoremNames[theorem.environment] = theorem.displayName;
      cursor = theorem.end - 1;
      continue;
    }

    const metadata = parseMetadataCommand(content, cursor);
    if (metadata) {
      declarations.metadata[metadata.key] = metadata.value;
      cursor = metadata.end - 1;
    }
  }

  return declarations;
}

function findClosingDelimiter(content: string, from: number, delimiter: string) {
  for (let cursor = from; cursor <= content.length - delimiter.length; cursor += 1) {
    if (!content.startsWith(delimiter, cursor) || isEscaped(content, cursor)) {
      continue;
    }

    if (delimiter === "$" && content[cursor + 1] === "$") {
      continue;
    }

    return cursor;
  }
  return -1;
}

function readProtectedMathEnd(content: string, index: number) {
  if (content[index] === "$" && !isEscaped(content, index)) {
    const delimiter = content[index + 1] === "$" ? "$$" : "$";
    const closing = findClosingDelimiter(content, index + delimiter.length, delimiter);
    return closing === -1 ? content.length : closing + delimiter.length;
  }

  if (content.startsWith("\\(", index)) {
    const closing = findClosingDelimiter(content, index + 2, "\\)");
    return closing === -1 ? content.length : closing + 2;
  }

  if (content.startsWith("\\[", index)) {
    const closing = findClosingDelimiter(content, index + 2, "\\]");
    return closing === -1 ? content.length : closing + 2;
  }

  return null;
}

function quoteMarkdown(content: string) {
  return content
    .trim()
    .split("\n")
    .map((line) => (line.length > 0 ? `> ${line}` : ">"))
    .join("\n");
}

function renderCallout(label: string, title: string | undefined, body: string, proof = false) {
  const cleanTitle = title?.trim();
  const heading = `**${label}${cleanTitle ? ` — ${cleanTitle}` : ""}.**`;
  const ending = proof ? "\n\n∎" : "";
  return `\n\n${quoteMarkdown(`${heading}\n\n${body.trim()}${ending}`)}\n\n`;
}

function transformOutsideFencedCode(content: string, context: TransformContext) {
  const parts = content.split(/(?<=\n)/);
  let activeFence: { length: number; marker: string } | null = null;
  let pending = "";
  let result = "";

  const flush = () => {
    result += transformLatexText(pending, context);
    pending = "";
  };

  for (const part of parts) {
    const fence = part.match(/^\s*(`{3,}|~{3,})/)?.[1];
    if (!fence) {
      if (activeFence) {
        result += part;
      } else {
        pending += part;
      }
      continue;
    }

    if (!activeFence) {
      flush();
      activeFence = { length: fence.length, marker: fence[0] };
      result += part;
      continue;
    }

    result += part;
    if (activeFence.marker === fence[0] && fence.length >= activeFence.length) {
      activeFence = null;
    }
  }

  flush();
  return result;
}

type SplitItem = {
  content: string;
  label?: string;
};

function splitCommandItems(content: string, commandName: "\\item" | "\\bibitem") {
  const starts: Array<{ contentStart: number; itemStart: number; label?: string }> = [];
  let braceDepth = 0;

  for (let cursor = 0; cursor < content.length; cursor += 1) {
    const mathEnd = readProtectedMathEnd(content, cursor);
    if (mathEnd !== null) {
      cursor = mathEnd - 1;
      continue;
    }

    const environment = readEnvironmentToken(content, cursor);
    if (environment?.kind === "begin") {
      const closing = findMatchingEnvironment(content, environment);
      if (closing) {
        cursor = closing.end - 1;
        continue;
      }
    }

    if (content[cursor] === "{" && !isEscaped(content, cursor)) {
      braceDepth += 1;
      continue;
    }
    if (content[cursor] === "}" && !isEscaped(content, cursor)) {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }

    if (braceDepth !== 0 || content[cursor] !== "\\") {
      continue;
    }

    const command = readControlSequence(content, cursor);
    if (command?.name !== commandName) {
      continue;
    }

    let contentStart = command.end;
    const label =
      commandName === "\\item"
        ? readOptionalArgument(content, contentStart)
        : readRequiredArgument(content, contentStart);
    if (label) {
      contentStart = label.end;
    }
    starts.push({ contentStart, itemStart: cursor, label: label?.value });
    cursor = contentStart - 1;
  }

  const items: SplitItem[] = starts.map((start, index) => ({
    content: content.slice(start.contentStart, starts[index + 1]?.itemStart ?? content.length),
    label: start.label,
  }));

  if (starts.length === 0 && content.trim()) {
    items.push({ content });
  }

  return items;
}

function indentContinuation(content: string) {
  const lines = content.trim().split("\n");
  return lines.map((line, index) => (index === 0 ? line : `    ${line}`)).join("\n");
}

function renderList(content: string, ordered: boolean, context: TransformContext) {
  const items = splitCommandItems(content, "\\item");
  const rendered = items.map((item, index) => {
    const label = item.label ? `**${transformLatexText(item.label, context)}** ` : "";
    const body = indentContinuation(transformLatexText(item.content, context));
    return `${ordered ? `${index + 1}.` : "-"} ${label}${body}`;
  });
  return `\n\n${rendered.join("\n")}\n\n`;
}

function splitTopLevel(content: string, delimiter: "&" | "\\\\") {
  const parts: string[] = [];
  let start = 0;
  let braceDepth = 0;

  for (let cursor = 0; cursor < content.length; cursor += 1) {
    const mathEnd = readProtectedMathEnd(content, cursor);
    if (mathEnd !== null) {
      cursor = mathEnd - 1;
      continue;
    }

    if (content[cursor] === "{" && !isEscaped(content, cursor)) {
      braceDepth += 1;
      continue;
    }
    if (content[cursor] === "}" && !isEscaped(content, cursor)) {
      braceDepth = Math.max(0, braceDepth - 1);
      continue;
    }

    if (braceDepth === 0 && content.startsWith(delimiter, cursor)) {
      parts.push(content.slice(start, cursor));
      cursor += delimiter.length - 1;
      start = cursor + 1;
    }
  }

  parts.push(content.slice(start));
  return parts;
}

function renderTabular(content: string, context: TransformContext) {
  const withoutRules = ["\\toprule", "\\midrule", "\\bottomrule", "\\hline"]
    .reduce((value, command) => value.replaceAll(command, ""), content)
    .trim();
  const rows = splitTopLevel(withoutRules, "\\\\")
    .map((row) => splitTopLevel(row, "&").map((cell) => transformLatexText(cell, context).trim()))
    .filter((row) => row.some(Boolean));

  if (rows.length === 0) {
    return "";
  }

  const columnCount = Math.max(...rows.map((row) => row.length));
  const normalizeRow = (row: string[]) => [...row, ...Array(Math.max(0, columnCount - row.length)).fill("")];
  const lines = [
    `| ${normalizeRow(rows[0]).join(" | ")} |`,
    `| ${Array(columnCount).fill("---").join(" | ")} |`,
    ...rows.slice(1).map((row) => `| ${normalizeRow(row).join(" | ")} |`),
  ];
  return `\n\n${lines.join("\n")}\n\n`;
}

function renderBibliography(content: string, context: TransformContext) {
  const items = splitCommandItems(content, "\\bibitem");
  const references = items.map((item, index) => {
    const key = item.label ? ` **[${item.label}]**` : "";
    return `${index + 1}.${key} ${transformLatexText(item.content, context).trim()}`;
  });
  return `\n\n### References\n\n${references.join("\n")}\n\n`;
}

function renderDocumentTitle(context: TransformContext) {
  const { author, date, title } = context.metadata;
  const lines: string[] = [];
  if (title) {
    lines.push(`# ${transformLatexText(title, context).trim()}`);
  }
  if (author) {
    lines.push(`_${transformLatexText(author, context).trim()}_`);
  }
  if (date) {
    lines.push(transformLatexText(date, context).trim());
  }
  return lines.length > 0 ? `\n\n${lines.join("\n\n")}\n\n` : "";
}

function renderEnvironment(
  content: string,
  opening: EnvironmentToken,
  closing: EnvironmentToken,
  context: TransformContext,
) {
  if (isMathEnvironment(opening.name)) {
    return content.slice(opening.start, closing.end);
  }

  let bodyStart = opening.end;
  const optionalTitle = readOptionalArgument(content, bodyStart);
  const theoremName = context.theoremNames[opening.name];
  if (optionalTitle && (theoremName || opening.name === "proof" || opening.name === "tcolorbox")) {
    bodyStart = optionalTitle.end;
  }

  if (["tabular", "tabular*", "minipage", "thebibliography", "minted"].includes(opening.name)) {
    const requiredConfiguration = readRequiredArgument(content, bodyStart);
    if (requiredConfiguration) {
      bodyStart = requiredConfiguration.end;
    }
  }

  const body = content.slice(bodyStart, closing.start);

  if (opening.name === "document") {
    return transformLatexText(body, context);
  }
  if (opening.name === "abstract") {
    return `\n\n### Abstract\n\n${transformLatexText(body, context).trim()}\n\n`;
  }
  if (opening.name === "proof") {
    return renderCallout(optionalTitle?.value || "Proof", undefined, transformLatexText(body, context), true);
  }
  if (theoremName) {
    return renderCallout(theoremName, optionalTitle?.value, transformLatexText(body, context));
  }
  if (opening.name === "itemize" || opening.name === "enumerate" || opening.name === "description") {
    return renderList(body, opening.name === "enumerate", context);
  }
  if (opening.name === "quote" || opening.name === "quotation" || opening.name === "tcolorbox") {
    const label = opening.name === "tcolorbox" ? optionalTitle?.value || "Note" : "Quote";
    return renderCallout(label, undefined, transformLatexText(body, context));
  }
  if (opening.name === "tabular" || opening.name === "tabular*") {
    return renderTabular(body, context);
  }
  if (opening.name === "thebibliography") {
    return renderBibliography(body, context);
  }
  if (VERBATIM_ENVIRONMENTS.has(opening.name)) {
    const language = opening.name === "minted" ? "text" : opening.name === "lstlisting" ? "text" : "";
    return `\n\n\`\`\`${language}\n${body.trim()}\n\`\`\`\n\n`;
  }
  if (UNWRAPPED_ENVIRONMENTS.has(opening.name)) {
    return transformLatexText(body, context);
  }

  // Unknown document-layout environments are safely unwrapped. Mathematical
  // environments remain untouched above and continue through KaTeX/MathJax.
  return transformLatexText(body, context);
}

function consumeArguments(content: string, index: number, maximum: number) {
  let cursor = index;
  const argumentsFound: ParsedGroup[] = [];

  for (let count = 0; count < maximum; count += 1) {
    const optional = readOptionalArgument(content, cursor);
    if (optional) {
      cursor = optional.end;
      continue;
    }
    const required = readRequiredArgument(content, cursor);
    if (!required) {
      break;
    }
    argumentsFound.push(required);
    cursor = required.end;
  }

  return { argumentsFound, end: cursor };
}

function safeLinkTarget(value: string) {
  const target = value.trim();
  return /^(?:https?:\/\/|mailto:)/i.test(target) ? target : "#";
}

function transformCommand(content: string, index: number, context: TransformContext) {
  const command = readControlSequence(content, index);
  if (!command) {
    return { end: index + 1, output: content[index] };
  }

  const macroDeclaration = parseNewCommand(content, index);
  if (macroDeclaration) {
    return { end: macroDeclaration.end, output: "" };
  }
  const theoremDeclaration = parseNewTheorem(content, index);
  if (theoremDeclaration) {
    return { end: theoremDeclaration.end, output: "" };
  }
  const metadataDeclaration = parseMetadataCommand(content, index);
  if (metadataDeclaration) {
    return { end: metadataDeclaration.end, output: "" };
  }

  if (command.name === "\\\\" || command.name === "\\newline" || command.name === "\\linebreak") {
    return { end: command.end, output: "  \n" };
  }
  if (command.name === "\\par") {
    return { end: command.end, output: "\n\n" };
  }
  if (command.name === "\\maketitle") {
    return { end: command.end, output: renderDocumentTitle(context) };
  }
  if (command.name === "\\appendix") {
    return { end: command.end, output: "\n\n## Appendix\n\n" };
  }

  const headingLevels: Record<string, string> = {
    "\\chapter": "#",
    "\\paragraph": "#####",
    "\\part": "#",
    "\\section": "##",
    "\\subparagraph": "######",
    "\\subsection": "###",
    "\\subsubsection": "####",
  };
  if (headingLevels[command.name]) {
    const title = readRequiredArgument(content, command.end);
    if (title) {
      return {
        end: title.end,
        output: `\n\n${headingLevels[command.name]} ${transformLatexText(title.value, context).trim()}\n\n`,
      };
    }
  }

  const formatting: Record<string, "bold" | "code" | "italic" | "plain"> = {
    "\\emph": "italic",
    "\\textbf": "bold",
    "\\textit": "italic",
    "\\textnormal": "plain",
    "\\textrm": "plain",
    "\\textsf": "plain",
    "\\textsl": "italic",
    "\\texttt": "code",
    "\\textup": "plain",
    "\\underline": "italic",
  };
  const format = formatting[command.name];
  if (format) {
    const argument = readRequiredArgument(content, command.end);
    if (argument) {
      const value = transformLatexText(argument.value, context).trim();
      const output = format === "bold" ? `**${value}**` : format === "italic" ? `*${value}*` : format === "code" ? `\`${value.replaceAll("`", "'")}\`` : value;
      return { end: argument.end, output };
    }
  }

  if (command.name === "\\textcolor" || command.name === "\\colorbox" || command.name === "\\fcolorbox") {
    const { argumentsFound, end } = consumeArguments(content, command.end, command.name === "\\fcolorbox" ? 3 : 2);
    const text = argumentsFound.at(-1)?.value;
    return { end, output: text ? transformLatexText(text, context) : "" };
  }

  if (command.name === "\\href") {
    const target = readRequiredArgument(content, command.end);
    const label = target ? readRequiredArgument(content, target.end) : null;
    if (target && label) {
      return {
        end: label.end,
        output: `[${transformLatexText(label.value, context)}](${safeLinkTarget(target.value)})`,
      };
    }
  }
  if (["\\url", "\\nolinkurl", "\\path"].includes(command.name)) {
    const target = readRequiredArgument(content, command.end);
    if (target) {
      const value = target.value.trim();
      return { end: target.end, output: `[${value}](${safeLinkTarget(value)})` };
    }
  }

  if (["\\cite", "\\citep", "\\citet"].includes(command.name)) {
    let cursor = command.end;
    const note = readOptionalArgument(content, cursor);
    if (note) {
      cursor = note.end;
    }
    const keys = readRequiredArgument(content, cursor);
    if (keys) {
      return { end: keys.end, output: `[${note ? `${note.value}; ` : ""}${keys.value}]` };
    }
  }

  if (["\\ref", "\\eqref", "\\autoref", "\\cref", "\\Cref"].includes(command.name)) {
    const label = readRequiredArgument(content, command.end);
    if (label) {
      const value = label.value.replaceAll(":", " ").replaceAll("-", " ");
      return { end: label.end, output: command.name === "\\eqref" ? `(${value})` : value };
    }
  }
  if (command.name === "\\label" || command.name === "\\index") {
    const label = readRequiredArgument(content, command.end);
    return { end: label?.end ?? command.end, output: "" };
  }
  if (command.name === "\\footnote" || command.name === "\\thanks") {
    const note = readRequiredArgument(content, command.end);
    if (note) {
      return { end: note.end, output: ` _(${transformLatexText(note.value, context)})_` };
    }
  }
  if (command.name === "\\caption") {
    const caption = readRequiredArgument(content, command.end);
    if (caption) {
      return { end: caption.end, output: `\n\n*${transformLatexText(caption.value, context)}*\n\n` };
    }
  }
  if (command.name === "\\includegraphics") {
    const optional = readOptionalArgument(content, command.end);
    const image = readRequiredArgument(content, optional?.end ?? command.end);
    return { end: image?.end ?? optional?.end ?? command.end, output: "_[Image omitted from LaTeX import]_" };
  }
  if (command.name === "\\multicolumn") {
    const { argumentsFound, end } = consumeArguments(content, command.end, 3);
    const value = argumentsFound[2]?.value;
    return { end, output: value ? transformLatexText(value, context) : "" };
  }

  const packageCommands: Record<string, number> = {
    "\\bibliography": 1,
    "\\bibliographystyle": 1,
    "\\documentclass": 1,
    "\\fancyfoot": 2,
    "\\fancyhead": 2,
    "\\hypersetup": 1,
    "\\pagestyle": 1,
    "\\setcounter": 2,
    "\\setlength": 2,
    "\\theoremstyle": 1,
    "\\urlstyle": 1,
    "\\usepackage": 1,
  };
  if (packageCommands[command.name]) {
    const consumed = consumeArguments(content, command.end, packageCommands[command.name]);
    return { end: consumed.end, output: "" };
  }

  if (["\\bigskip", "\\medskip", "\\smallskip", "\\newpage", "\\clearpage", "\\pagebreak"].includes(command.name)) {
    return { end: command.end, output: "\n\n" };
  }
  if (["\\centering", "\\noindent", "\\raggedleft", "\\raggedright", "\\small", "\\large", "\\Large", "\\LARGE", "\\normalsize"].includes(command.name)) {
    return { end: command.end, output: "" };
  }
  if (command.name === "\\hfill" || command.name === "\\quad" || command.name === "\\qquad") {
    return { end: command.end, output: " " };
  }
  if (command.name === "\\item") {
    const label = readOptionalArgument(content, command.end);
    return { end: label?.end ?? command.end, output: `\n- ${label ? `**${label.value}** ` : ""}` };
  }

  const escapedCharacters: Record<string, string> = {
    "\\#": "#",
    "\\$": "$",
    "\\%": "%",
    "\\&": "&",
    "\\_": "_",
    "\\{": "{",
    "\\}": "}",
  };
  if (escapedCharacters[command.name]) {
    return { end: command.end, output: escapedCharacters[command.name] };
  }
  if (command.name === "\\LaTeX" || command.name === "\\TeX") {
    return { end: command.end, output: command.name.slice(1) };
  }
  if (context.macros[command.name]) {
    return { end: command.end, output: `$${command.name}$` };
  }

  const argument = readRequiredArgument(content, command.end);
  if (argument) {
    return { end: argument.end, output: transformLatexText(argument.value, context) };
  }

  return { end: command.end, output: command.name.slice(1) };
}

function transformLatexText(content: string, context: TransformContext): string {
  let result = "";

  for (let cursor = 0; cursor < content.length;) {
    const mathEnd = readProtectedMathEnd(content, cursor);
    if (mathEnd !== null) {
      result += content.slice(cursor, mathEnd);
      cursor = mathEnd;
      continue;
    }

    const opening = readEnvironmentToken(content, cursor);
    if (opening?.kind === "begin") {
      const closing = findMatchingEnvironment(content, opening);
      if (closing) {
        result += renderEnvironment(content, opening, closing, context);
        cursor = closing.end;
        continue;
      }

      if (opening.name === "document") {
        cursor = opening.end;
        continue;
      }
      const theoremName = context.theoremNames[opening.name];
      if (theoremName) {
        const title = readOptionalArgument(content, opening.end);
        result += `\n\n> **${theoremName}${title ? ` — ${title.value}` : ""}.**\n>\n> `;
        cursor = title?.end ?? opening.end;
        continue;
      }
    }
    if (opening?.kind === "end") {
      cursor = opening.end;
      continue;
    }

    if (content[cursor] === "%" && !isEscaped(content, cursor)) {
      const lineEnd = content.indexOf("\n", cursor);
      cursor = lineEnd === -1 ? content.length : lineEnd;
      continue;
    }

    if (content[cursor] === "\\") {
      const transformed = transformCommand(content, cursor, context);
      result += transformed.output;
      cursor = transformed.end;
      continue;
    }

    result += content[cursor] === "~" ? " " : content[cursor];
    cursor += 1;
  }

  return result;
}

/**
 * Converts the document-level subset of LaTeX into Markdown while preserving
 * every mathematical payload for the dedicated KaTeX/MathJax pipeline.
 */
export function prepareLatexDocument(content: string): PreparedLatexDocument {
  const openingDocument = findEnvironment(content, "document", "begin");
  const closingDocument = openingDocument ? findEnvironment(content, "document", "end", openingDocument.end) : null;
  const declarationSource = openingDocument ? content.slice(0, openingDocument.start) : content;
  const declarations = collectDeclarations(declarationSource);
  const documentBody = openingDocument
    ? content.slice(openingDocument.end, closingDocument?.start ?? content.length)
    : content;

  return {
    content: transformOutsideFencedCode(documentBody, declarations).trim(),
    macros: declarations.macros,
  };
}
