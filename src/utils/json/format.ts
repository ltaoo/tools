/**
 * 简单的 JSON 格式化工具，旨在尽可能格式化无效的 JSON
 */
export function formatJSON(json: string, indentSize = 4): string {
  let result = "";
  let indent = 0;
  let inString = false;
  let quoteChar = "";
  let isEscape = false;
  let inLineComment = false;
  let inBlockComment = false;
  let pendingSpace = false;

  for (let i = 0; i < json.length; i++) {
    const char = json[i];
    const nextChar = json[i + 1];

    // Handle Line Comments
    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        result += char + " ".repeat(indent * indentSize);
      } else {
        result += char;
      }
      continue;
    }

    // Handle Block Comments
    if (inBlockComment) {
      result += char;
      if (char === "*" && nextChar === "/") {
        inBlockComment = false;
        result += "/";
        i++;
      }
      continue;
    }

    // Handle Strings
    if (inString) {
      if (char === "\\") {
        isEscape = !isEscape;
      } else if (char === quoteChar && !isEscape) {
        inString = false;
        quoteChar = "";
      } else {
        isEscape = false;
      }
      result += char;
      continue;
    }

    // Start of String
    if (char === '"' || char === "'") {
      if (pendingSpace) {
        result += " ";
        pendingSpace = false;
      }
      inString = true;
      quoteChar = char;
      result += char;
      continue;
    }

    // Start of Comments
    if (char === "/" && nextChar === "/") {
      if (pendingSpace) {
        result += " ";
        pendingSpace = false;
      }
      inLineComment = true;
      result += "//";
      i++;
      continue;
    }
    if (char === "/" && nextChar === "*") {
      if (pendingSpace) {
        result += " ";
        pendingSpace = false;
      }
      inBlockComment = true;
      result += "/*";
      i++;
      continue;
    }

    // Whitespace
    if (/\s/.test(char)) {
      if (char === "\n") {
        // Treat newline as a space if not in comment, but we usually strip it in favor of auto-formatting
        // But if we have `a\nb`, we want `a b` (or `a\nb` preserved?)
        // Let's treat it as space.
        pendingSpace = true;
      } else {
        pendingSpace = true;
      }
      continue;
    }

    // Structural Characters
    if (char === "{" || char === "[") {
      // pendingSpace doesn't matter before { or [ usually, but let's ignore it to be clean
      pendingSpace = false;
      indent++;
      result += char + "\n" + " ".repeat(indent * indentSize);
      continue;
    }

    if (char === "}" || char === "]") {
      pendingSpace = false;
      indent = Math.max(0, indent - 1);
      // Ensure we start on a new line if not already (simple check: last char was not newline)
      // But we stripped whitespace, so we need to add newline.
      // Exception: Empty object `{}` -> `{\n  \n}`.
      if (result.endsWith(" ".repeat((indent + 1) * indentSize))) {
        // This means we just opened it? `{ \n  `.
        // If we close immediately `}`, we get `{ \n  \n  }`.
        // We might want to trim the trailing spaces and put `}` on same line for empty?
        // But for simplicity, let's just break line.
      }
      result += "\n" + " ".repeat(indent * indentSize) + char;
      continue;
    }

    if (char === ",") {
      pendingSpace = false;
      result += char + "\n" + " ".repeat(indent * indentSize);
      continue;
    }

    if (char === ":") {
      pendingSpace = false;
      result += char + " ";
      continue;
    }

    // Other characters (alphanumeric, etc.)
    if (pendingSpace) {
      result += " ";
      pendingSpace = false;
    }
    result += char;
  }

  return result;
}
