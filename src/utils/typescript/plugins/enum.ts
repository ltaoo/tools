import {
  generateWhitespace,
  upperFirstCase,
  ConverterLifetimes,
} from "@/utils/typescript";

/**
 * 从一段文本中提取枚举值和对应描述
 * @param content
 * @param regexp
 * @returns
 */
export function extraEnumAndTitle(content: string, regexp: RegExp) {
  const r: {
    /** 枚举字段 */
    name: string;
    /** 枚举注释 */
    comment: string;
    /** 枚举值 */
    value: number | string;
  }[] = [];
  let d = content;
  while (d) {
    const result = d.match(regexp);
    if (!result) {
      break;
    }
    d = d.slice((result.index || 0) + result[0].length);
    const value = result[1];
    const comment = result[2];
    const name = result[3];
    r.push({
      name: name || comment,
      comment,
      value: /[0-9]{1,}/.test(value) ? Number(value) : value,
    });
  }
  return r;
}

export function tsEnumPlugin(regexp: RegExp) {
  let extraLines: string[] = [];
  return {
    typeNode(node, options) {
      const { type, description } = node;
      const { parentKeys = [] } = options;
      if (!description) {
        return type;
      }
      const isEnum = regexp.test(description);
      // console.log("[PLUGIN](ExtraEnum)", isEnum, type, parentKeys);
      if (!isEnum) {
        return type;
      }
      if (parentKeys.length === 0) {
        return type;
      }
      const enums = extraEnumAndTitle(description!, regexp);
      // console.log("[PLUGIN](tsExtraEnumPlugin)", enums);
      const n = parentKeys.map(upperFirstCase).join("");
      const lines = enums
        .map((e) => {
          const { value, name, comment } = e;
          return [`/** ${comment} */`, `${name} = ${value},`].map(
            (s) => generateWhitespace(1) + s
          );
        })
        .reduce((prev, total) => prev.concat(total), [] as string[]);
      extraLines = extraLines.concat(
        [`enum ${n} {`].concat(lines).concat(["};"])
      );
      return n;
    },
    beforeOutput() {
      return extraLines;
    },
    afterOutput() {
      extraLines = [];
      return [];
    },
  } as ConverterLifetimes;
}

export function jsEnumPlugin(regexp: RegExp) {
  let extraLines: string[] = [];
  return {
    typeNode: (node, options) => {
      const { type, description } = node;
      const { parentKeys = [] } = options;
      if (!description) {
        return type;
      }
      const isEnum = regexp.test(description);
      // console.log("[PLUGIN](ExtraEnum)", isEnum, type, parentKeys);
      if (!isEnum) {
        return type;
      }
      if (parentKeys.length === 0) {
        return type;
      }
      const enums = extraEnumAndTitle(description!, regexp);
      // console.log("[PLUGIN](JSExtraEnum)", enums);
      const n = parentKeys.map(upperFirstCase).join("") as string;
      const lines = enums
        .map((e) => {
          const { value, name, comment } = e;
          return [`/** ${comment} */`, `${name}: ${value},`].map(
            (s) => generateWhitespace(1) + s
          );
        })
        .reduce((prev, total) => prev.concat(total), [] as string[]);
      const t = enums[0] ? typeof enums[0].value : "number";
      extraLines = extraLines.concat(
        [`/** @enum {${t}} */`, `const ${n} = {`].concat(lines).concat(["};"])
      );
      return n;
    },
    beforeOutput() {
      // console.log("[PLUGIN](js enum)invoke before output", extraLines);
      return extraLines;
    },
    afterOutput() {
      extraLines = [];
      return [];
    },
  } as ConverterLifetimes;
}
