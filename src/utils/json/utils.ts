import { Space_Separator, ID_Continue, ID_Start } from "./unicode";

/**
 * 是否是空白分隔符
 * \u1680\u2000-\u200A\u202F\u205F\u3000  之间的字符
 */
export function isSpaceSeparator(c: string) {
  return typeof c === "string" && Space_Separator.test(c);
}

export function isIdStartChar(c?: string) {
  return (
    typeof c === "string" &&
    ((c >= "a" && c <= "z") ||
      (c >= "A" && c <= "Z") ||
      c === "$" ||
      c === "_" ||
      ID_Start.test(c))
  );
}

export function isIdContinueChar(c?: string) {
  return (
    typeof c === "string" &&
    ((c >= "a" && c <= "z") ||
      (c >= "A" && c <= "Z") ||
      (c >= "0" && c <= "9") ||
      c === "$" ||
      c === "_" ||
      c === "\u200C" ||
      c === "\u200D" ||
      ID_Continue.test(c))
  );
}

export function isHexDigit(c?: string) {
  return typeof c === "string" && /[0-9A-Fa-f]/.test(c);
}

export function isDigit(c?: string) {
  return typeof c === "string" && /[0-9]/.test(c);
}

export default {
  isSpaceSeparator(c: string) {
    return typeof c === "string" && Space_Separator.test(c);
  },

  isIdStartChar(c: string) {
    return (
      typeof c === "string" &&
      ((c >= "a" && c <= "z") ||
        (c >= "A" && c <= "Z") ||
        c === "$" ||
        c === "_" ||
        ID_Start.test(c))
    );
  },

  isIdContinueChar(c: string) {
    return (
      typeof c === "string" &&
      ((c >= "a" && c <= "z") ||
        (c >= "A" && c <= "Z") ||
        (c >= "0" && c <= "9") ||
        c === "$" ||
        c === "_" ||
        c === "\u200C" ||
        c === "\u200D" ||
        ID_Continue.test(c))
    );
  },

  isDigit(c: string) {
    return typeof c === "string" && /[0-9]/.test(c);
  },

  isHexDigit(c: string) {
    return typeof c === "string" && /[0-9A-Fa-f]/.test(c);
  },
};
