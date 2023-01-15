enum JSONSchemaTypes {
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
function inner(
  schema: JSONSchema,
  parent: JSONSchema | null,
  deep: number = 0
): string | string[] {
  const { type } = schema;
  if (type === JSONSchemaTypes.String) {
    // if (parent?.type === JSONSchemaTypes.Array) {
    //   return "string,";
    // }
    return `string`;
  }
  if (type === JSONSchemaTypes.Number) {
    // if (parent?.type === JSONSchemaTypes.Array) {
    //   return "number,";
    // }
    return `number`;
  }
  if (type === JSONSchemaTypes.Boolean) {
    // if (parent?.type === JSONSchemaTypes.Array) {
    //   return "boolean,";
    // }
    return `boolean`;
  }
  if (type === JSONSchemaTypes.Null) {
    // if (parent?.type === JSONSchemaTypes.Array) {
    //   return "null,";
    // }
    return `null`;
  }
  if (type === JSONSchemaTypes.Object) {
    const { properties } = schema;
    const normalIndent = (() => {
      if (parent === null) {
        return true;
      }
      if (
        parent.type === JSONSchemaTypes.Array &&
        !Array.isArray(parent.items)
      ) {
        return false;
      }
      return true;
    })();
    const propertySignatures = Object.keys(properties).map((key) => {
      const property = properties[key];
      const propertyDeep = deep + 1;
      let value = inner(property, schema, propertyDeep);
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
      // 加分号
      return addStrAtEndOfArrayItem(r, ";");
    });
    const result = ["{", ...propertySignatures, "}"]
      .map((line) => {
        return [line];
      })
      .reduce((cur, total) => {
        return cur.concat(total);
      }, [] as string[])
      .map((line) => {
        const s = generateWhitespace(1);
        // console.log("line adding space", line, typeof line, s);
        return line;
      })
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
          const line = inner(item, schema, nextDeep);
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
          // console.log("in array loop", line);
          return s + line;
        });
      // console.log("array lines", childNodes);
      return ["[", ...childNodes, "]"];
    }
    const originalLines = inner(items, schema, nextDeep);
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
export function jsonSchema2Interface(schema: JSONSchema, deep = 0): string {
  const result = inner(schema, null, deep);
  // console.log("result in the end", result);
  if (Array.isArray(result)) {
    return result.join("\n");
  }
  return result;
}

/**
 * JSON schema 转 typescript js doc
 * @param {JSONSchema} schema
 * @param {number} deep 深度，用来生成缩进空白符
 */
export function jsonSchema2JSDoc(
  schema: JSONSchema,
  ownerKeys: string[] = [],
  deep: number = 0
): string {
  const { type, description, title } = schema;
  if (type === JSONSchemaTypes.String) {
    let s = ` * @prop {string} ${ownerKeys.join(".")}`;
    if (description) {
      return s + ` ${description}`;
    }
    return s;
  }
  if (type === JSONSchemaTypes.Number) {
    let s = ` * @prop {number} ${ownerKeys.join(".")}`;
    if (description) {
      return s + ` ${description}`;
    }
    return s;
  }
  if (type === JSONSchemaTypes.Boolean) {
    let s = ` * @prop {boolean} ${ownerKeys.join(".")}`;
    if (description) {
      return s + ` ${description}`;
    }
    return s;
  }
  if (type === JSONSchemaTypes.Null) {
    let s = ` * @prop {null} ${ownerKeys.join(".")}`;
    if (description) {
      return s + ` ${description}`;
    }
    return s;
  }
  if (type === JSONSchemaTypes.Object) {
    const { properties, description } = schema;
    // 处理子元素
    const propertySignatures = Object.keys(properties)
      .map((key) => {
        // console.log("[](jsonSchema2JSDoc) - properties loop", key);
        const property = jsonSchema2JSDoc(
          properties[key],
          ownerKeys.concat([key]),
          deep + 1
        );
        // console.log("[](jsonSchema2JSDoc) - created child", key, property);
        let keyAndValue: string = property;
        return keyAndValue;
      })
      .join("\n");
    if (deep === 0) {
      return `/**\n * @typedef {object} ResponseRoot\n${propertySignatures}\n */`;
    }
    let s = ` * @prop {object} ${ownerKeys.join(".")}`;
    if (description) {
      s += ` ${(() => {
        if (description.includes("\n")) {
          return description.split("\n").join("。");
        }
        return description;
      })()}`;
    }
    s += `\n${propertySignatures}`;
    return s;
  }
  if (type === JSONSchemaTypes.Array) {
    const { items } = schema;
    if (Array.isArray(items)) {
      return items
        .map((item) => {
          return jsonSchema2Interface(item, deep + 1);
        })
        .join("\n");
    }
    let s = ` * @prop {${items.type}[]} ${ownerKeys.join(".")}`;
    if (description) {
      return s + ` ${description}`;
    }
    return s;
  }
  let s = ` * @prop {unknown} ${ownerKeys.join(".")}`;
  if (description) {
    return s + ` ${description}`;
  }
  return s;
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
function generateWhitespace(indent: number, size = 2) {
  let i = indent < 0 ? 0 : indent;
  if (i === 0) {
    return "";
  }
  return " ".repeat(i * size);
}
