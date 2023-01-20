import { DEFAULT_ROOT_KEY } from "./constants";

export enum JSONSchemaTypes {
  String = "string",
  Number = "number",
  Object = "object",
  Array = "array",
  Boolean = "boolean",
  Null = "null",
}
export type MutableRecord<U> = {
  [SubType in keyof U]: {
    type: SubType;
  } & U[SubType];
}[keyof U];

export type JSONSchema = MutableRecord<{
  [JSONSchemaTypes.String]: {
    /** 最小长度 */
    minLength?: number;
    /** 最大长度 */
    maxLength?: number;
    /** 标题 */
    title?: string;
    /** 描述(相比标题可以更长，但作用是相同的) */
    description?: string;
  };
  [JSONSchemaTypes.Number]: {
    /** 是否为该倍数 */
    multipleOf?: number;
    /** 最小值 */
    minimum?: number;
    /** 最大值 */
    maximum?: number;
    /** 标题 */
    title?: string;
    /** 描述(相比标题可以更长，但作用是相同的) */
    description?: string;
  };
  [JSONSchemaTypes.Object]: {
    /** 键值对 */
    properties: Record<string, JSONSchema>;
    /** 必须存在的键 */
    required?: string[];
    /** 标题 */
    title?: string;
    /** 描述(相比标题可以更长，但作用是相同的) */
    description?: string;
  };
  [JSONSchemaTypes.Array]: {
    /** 元素 */
    items: JSONSchema[] | JSONSchema;
    /** 标题 */
    title?: string;
    /** 描述(相比标题可以更长，但作用是相同的) */
    description?: string;
  };
  [JSONSchemaTypes.Boolean]: {
    /** 标题 */
    title?: string;
    /** 描述(相比标题可以更长，但作用是相同的) */
    description?: string;
  };
  [JSONSchemaTypes.Null]: {
    /** 标题 */
    title?: string;
    /** 描述(相比标题可以更长，但作用是相同的) */
    description?: string;
  };
}>;

/**
 * 从 json schema 构建 interface，但是返回的是数组，每一个元素是一行内容
 * @param {JSONSchema} schema
 * @param {number} deep
 * @returns {string[]}
 */
export function buildInterfaceLines(
  schema: JSONSchema,
  deep: number = 0
): string | string[] {
  const { type } = schema;
  if (type === JSONSchemaTypes.String) {
    return `string`;
  }
  if (type === JSONSchemaTypes.Number) {
    return `number`;
  }
  if (type === JSONSchemaTypes.Boolean) {
    return `boolean`;
  }
  if (type === JSONSchemaTypes.Null) {
    return `null`;
  }
  if (type === JSONSchemaTypes.Object) {
    const { properties } = schema;
    const propertySignatures = Object.keys(properties).map((key) => {
      const property = properties[key];
      const propertyDeep = deep + 1;
      let value = buildInterfaceLines(property, propertyDeep);
      const comments = buildCommentFromDescription(property.description);
      let keyAndValue: string | string[] = `${key}: ${value}`;
      if (Array.isArray(value)) {
        keyAndValue = [`${key}: ${value[0]}`].concat(value.slice(1));
      }
      const lines = Array.isArray(keyAndValue) ? keyAndValue : [keyAndValue];
      if (comments.length > 0) {
        lines.unshift(...comments);
      }
      const s = generateWhitespace(1);
      const r = lines.map((line) => s + line);
      return addStrAtEndOfArrayItem(r, ";");
    });
    const result = ["{", ...propertySignatures, "}"]
      .map((line) => {
        return [line];
      })
      .reduce((cur, total) => {
        return cur.concat(total);
      }, [] as string[])
      .reduce((prev, cur) => {
        if (Array.isArray(cur)) {
          return (prev as string[]).concat(cur);
        }
        return (prev as string[]).concat([cur]);
      }, [] as string[]);
    // console.log("lines after add space", result);
    return result;
  }
  if (type === JSONSchemaTypes.Array) {
    const { items } = schema;
    const nextDeep = deep + 1;
    if (Array.isArray(items)) {
      const s = generateWhitespace(1);
      const childNodes = items
        .map((item) => {
          const line = buildInterfaceLines(item, nextDeep);
          const c = buildCommentFromDescription(item.description);
          if (Array.isArray(line)) {
            return c.concat(line);
          }
          return c.concat([line]);
        })
        .map((line, i) => {
          // 加逗号
          let comma = i === items.length - 1 ? "" : ",";
          if (Array.isArray(line)) {
            return addStrAtEndOfArrayItem(line, comma);
          }
          return [line + comma];
        })
        .reduce((cur, total) => {
          return cur.concat(total);
        }, [] as string[])
        .map((line) => {
          return s + line;
        });
      return ["[", ...childNodes, "]"];
    }
    const originalLines = buildInterfaceLines(items, nextDeep);
    if (Array.isArray(originalLines)) {
      return addStrAtEndOfArrayItem(originalLines, "[]");
    }
    return `${originalLines}[]`;
  }
  return "unknown type";
}

function addStrAtEndOfArrayItem(arr: string[], str: string) {
  return arr.slice(0, arr.length - 1).concat([arr[arr.length - 1] + str]);
}
/**
 * JSON schema 转 typescript interface
 * @param {JSONSchema} schema
 * @param {number} deep 深度，用来生成缩进空白符
 * @param {boolean} needSpace 是否需要空白，如果是数组内的元素，是需要的，其他情况下是键值对，所以不需要空白
 */
export function jsonSchema2Interface(
  schema: JSONSchema,
  options: Partial<{
    rootKey: string;
  }> = {}
): string {
  const { rootKey = DEFAULT_ROOT_KEY } = options;
  const result = buildInterfaceLines(schema);
  if (Array.isArray(result)) {
    if (result[0] === "{") {
      return [`interface ${rootKey} ${result[0]}`]
        .concat(result.slice(1))
        .join("\n");
    }
    return result.join("\n");
  }
  return result;
}

let extraTypes: string[] = [];
/**
 * JSON schema 转 typescript js doc
 * @param {JSONSchema} schema
 * @param parentKeys 父路径，如果当前字段是 c，那么 a.b.c 中的 ['a', 'b'] 就是 parentKeys
 * @param {number} deep 深度，用来生成缩进空白符
 */
export function buildJSDocLines(
  schema: JSONSchema,
  parentKeys: string[] = ["ResponseRoot"],
  deep: number = 0
): string | string[] {
  const { type, description } = schema;
  if (type === JSONSchemaTypes.String) {
    return "string";
    // let s = ` * @prop {string} ${parentKeys.join(".")}`;
    // if (description) {
    //   return s + ` ${description}`;
    // }
    // return s;
  }
  if (type === JSONSchemaTypes.Number) {
    return "number";
    // let s = ` * @prop {number} ${parentKeys.join(".")}`;
    // if (description) {
    //   return s + ` ${description}`;
    // }
    // return s;
  }
  if (type === JSONSchemaTypes.Boolean) {
    return "boolean";
    // let s = ` * @prop {boolean} ${parentKeys.join(".")}`;
    // if (description) {
    //   return s + ` ${description}`;
    // }
    // return s;
  }
  if (type === JSONSchemaTypes.Null) {
    return "null";
    // let s = ` * @prop {null} ${parentKeys.join(".")}`;
    // if (description) {
    //   return s + ` ${description}`;
    // }
    // return s;
  }
  if (type === JSONSchemaTypes.Object) {
    const { properties, description } = schema;
    const propertySignatures = Object.keys(properties)
      .map((key) => {
        const property = properties[key];
        const { description: propDescription } = property;
        // console.log("[](jsonSchema2JSDoc) - properties loop", key, parentKeys);
        const value = buildJSDocLines(
          property,
          parentKeys.concat([key]),
          deep + 1
        );
        // console.log("[](jsonSchema2JSDoc) - created property", key, value);
        // 如果是数组，说明返回的是一个对象/数组的声明
        if (Array.isArray(value)) {
          if (value[0] === "Object") {
            return value.slice(2);
          }
          return value;
        }
        const keys = parentKeys.concat(key).join(".");
        const propString = ` * @prop {${value}} ${keys}`;
        if (propDescription) {
          return `${propString} ${propDescription}`;
        }
        return propString;
      })
      .reduce((prev, cur) => {
        if (Array.isArray(cur)) {
          return (prev as string[]).concat(cur);
        }
        return (prev as string[]).concat([cur]);
      }, [] as string[]);
    // console.log(
    //   "[](buildJSDocLines) - loop an object properties completed",
    //   propertySignatures
    // );
    const keys = parentKeys.join(".");
    let s = ` * @${
      parentKeys.length === 1 ? "typedef" : "prop"
    } {object} ${keys}`;
    if (description) {
      s += ` ${(() => {
        if (description.includes("\n")) {
          return description.split("\n").join("。");
        }
        return description;
      })()}`;
    }
    if (deep === 0) {
      return [s, ...propertySignatures];
    }
    return ["Object", keys, s, ...propertySignatures];
  }
  if (type === JSONSchemaTypes.Array) {
    const { items } = schema;
    if (Array.isArray(items)) {
      const lines = items.map((item, i) => {
        const lines = buildJSDocLines(
          item,
          [generateArrayItemName(i, parentKeys)],
          deep + 1
        );
        if (Array.isArray(lines) && lines[0] === "Object") {
          extraTypes.push(...lines.slice(2));
          return lines[1];
        }
        return lines;
      });
      return `[${lines.join(", ")}]`;
    }
    const value = buildJSDocLines(
      items,
      [generateArrayItemName(0, parentKeys)],
      deep + 1
    );
    // console.log("[]() same type in array, so the value is", value);
    if (Array.isArray(value)) {
      if (Array.isArray(value) && value[0] === "Object") {
        extraTypes.push(...value.slice(2));
        return `${value[1]}[]`;
      }
      return value;
    }
    const s = `${value}[]`;
    return s;
  }
  return "unknown";
}

/**
 * JSON schema 转 typescript js doc
 * @param {JSONSchema} schema
 */
export function jsonSchema2JSDoc(
  schema: JSONSchema,
  /** 额外配置 */
  options: Partial<{
    /** 根名称 */
    rootKey: string;
  }> = {}
) {
  const { rootKey = "ResponseRoot" } = options;
  extraTypes = [];
  const lines = buildJSDocLines(schema, [rootKey]);
  // console.log("[](jsonSchema2JSDoc) result lines", lines, extraTypes);
  const prefixLines = (() => {
    if (extraTypes.length === 0) {
      return [];
    }
    return extraTypes.concat(" *");
  })();
  if (Array.isArray(lines)) {
    return ["/**", ...prefixLines.concat(lines), " */"].join("\n");
  }
  return ["/**", lines, " */"].join("\n");
}

/**
 * 构建注释，为了通用返回一个数组，如果是多行注释，就有多个元素，否则就是一个元素
 * @param {string} description 注释
 * @returns {string[]}
 */
export function buildCommentFromDescription(description?: string) {
  if (description === undefined) {
    return [];
  }
  if (description.includes("\n")) {
    return [`/**`]
      .concat(description.split("\n").map((line) => ` * ${line}`))
      .concat([` */`]);
  }
  return [`/** ${description} */`];
}

/**
 * 生成缩进的空格
 * @param {number} indent 缩进几次
 * @param {number} size 几个空格
 * @returns
 */
export function generateWhitespace(indent: number, size = 2) {
  let i = indent < 0 ? 0 : indent;
  if (i === 0) {
    return "";
  }
  return " ".repeat(i * size);
}

const indexEnglishWord: Record<number, string> = {
  0: "First",
  1: "Second",
  2: "Third",
  3: "Fourth",
  4: "Fifthly",
};
export function generateArrayItemName(index: number, keys: string[] = []) {
  // console.log("[](generateArrayItemName)", keys);
  let suffix = (() => {
    if (keys.length === 0) {
      return "ArrayItem";
    }
    return upperFirstCase(keys[keys.length - 1]);
  })();
  const englishWord = indexEnglishWord[index];
  if (englishWord) {
    return englishWord + suffix;
  }
  return index + suffix;
}

function generateUppercaseKeyFromKeys(keyString: string) {
  const keys = keyString.split(".");
  const key = keys[keys.length - 1];
  return key;
}

export function upperFirstCase(key: string) {
  if (key.length <= 1) {
    return key;
  }
  return key[0].toUpperCase() + key.slice(1);
}

export function lowerFirstCase(key: string) {
  if (key.length <= 1) {
    return key;
  }
  return key[0].toLowerCase() + key.slice(1);
}
