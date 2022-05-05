import { IReplaceRules, IContentExtract } from "./types";

export function getCapture(matched: RegExpMatchArray | null): string | null {
  if (matched === null) {
    return null;
  }
  return matched[1];
}
/**
 * 移除正则左右两边的 / 符号
 */
export function removeRegexpBoundaries(regexp_str: string) {
  if (regexp_str[0] === "/") {
    return regexp_str.slice(1, -1);
  }
  return regexp_str;
}
export function r(regexp_str: string, modifies?: string) {
  return new RegExp(removeRegexpBoundaries(regexp_str), modifies);
}
export function m(content?: string) {
  /**
   * 根据正则从文本中提取内容
   */
  return (
    regexp_str?: IContentExtract,
    modifies?: string
  ): null | string | string[] => {
    if (content === undefined) {
      return "";
    }
    if (!regexp_str) {
      // 没有正则表示不需要匹配
      return null;
    }
    // 范围限定
    const scoped = regexp_str.s
      ? (() => {
          console.log("[] limit content scope");
          const res = content.match(regexp_str.s);
          if (res) {
            return res[0];
          }
          return content;
        })()
      : content;
    // 前置清理
    const clean_content = replace<typeof scoped>(scoped)(regexp_str.b);
    // 内容提取
    console.log("[] before extract content");
    console.log(clean_content);
    console.log(regexp_str.r);
    console.log();
    const res = clean_content.match(r(regexp_str.r, modifies));
    let rrr: null | string[] | string = null;
    if (modifies?.includes("g")) {
      rrr = res as string[];
    } else {
      rrr = getCapture(res) as null | string;
    }
    if (rrr === null) {
      return rrr;
    }
    // 后置清理
    const processed_res = replace<typeof rrr>(rrr)(regexp_str.a);
    return processed_res;
  };
}

export function rr(
  content: string | string[],
  regexp: string,
  replacement: string,
  modifies: string = "g"
) {
  const reg = r(regexp, modifies);
  if (Array.isArray(content)) {
    return content.map((c) => {
      return c.replace(reg, replacement);
    });
  }
  const res = content.replace(reg, replacement);
  return res;
}

/**
 * 替换文本内容
 * @param content
 * @returns
 */
export function replace<T extends string | string[]>(content: null | T) {
  return (rules?: IReplaceRules, modifies?: string): T => {
    // console.log("replace", rules);
    if (!content) {
      return "" as T;
    }
    if (rules === undefined) {
      return content;
    }
    if (!Array.isArray(rules)) {
      return content;
    }
    if (rules.length === 0) {
      return content;
    }
    let result = content;
    if (Array.isArray(rules[0])) {
      // rules = [[/abc/, '123'], [/efg/, '456']]
      for (let i = 0; i < rules.length; i += 1) {
        const [regexp_str, replacement] = rules[i] as [string, string];
        result = rr(result, regexp_str, replacement, modifies) as T;
      }
    }
    return result;
  };
}
