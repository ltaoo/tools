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

type JSONSchema = MutableRecord<{
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
 * JSON schema 转 typescript interface
 * @param {JSONSchema} schema
 * @param {number} deep 深度，用来生成缩进空白符
 * @param {boolean} needSpace 是否需要空白，如果是数组内的元素，是需要的，其他情况下是键值对，所以不需要空白
 */
export function jsonSchema2Interface(
  schema: JSONSchema,
  deep = 0,
  needSpace = false
): string {
  const { type } = schema;
  const spp = generateWhitespace(deep);
  const sp = needSpace ? spp : "";
  if (type === JSONSchemaTypes.String) {
    return `${sp}string`;
  }
  if (type === JSONSchemaTypes.Number) {
    return `${sp}number`;
  }
  if (type === JSONSchemaTypes.Boolean) {
    return `${sp}boolean`;
  }
  if (type === JSONSchemaTypes.Null) {
    return `${sp}null`;
  }
  if (type === JSONSchemaTypes.Object) {
    const { properties } = schema;
    const space = generateWhitespace(deep + 1);
    const propertySignatures = Object.keys(properties)
      .map((key) => {
        const { description } = properties[key];
        let keyAndValue: string = `${space}${key}: ${jsonSchema2Interface(
          properties[key],
          deep + 1
        )};`;
        if (description) {
          keyAndValue =
            `${buildCommentFromDescription(description, deep + 1)}\n` +
            keyAndValue;
        }
        return keyAndValue;
      })
      .join("\n");
    return `${
      needSpace ? sp : ""
    }{\n${propertySignatures}\n${generateWhitespace(deep)}}`;
  }
  if (type === JSONSchemaTypes.Array) {
    const { items, description } = schema;
    if (Array.isArray(items)) {
      const childNodes = items
        .map((item) => {
          return jsonSchema2Interface(item, deep + 1, true);
        })
        .join(",\n");
      return `[\n${childNodes}\n${spp}]`;
    }
    if (needSpace) {
      const dd = buildCommentFromDescription(description, deep);
      return `${dd}\n${sp}${items.type}[]`;
    }
    return `${sp}${items.type}[]`;
    // return `${sp}${jsonSchema2Interface(schema, deep + 1)}[]`;
  }
  return "unknown type";
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
 * 构建注释
 * @param {string} description 注释
 * @param {number} indent 缩进
 * @returns
 */
export function buildCommentFromDescription(
  description?: string,
  indent: number = 0
) {
  if (description === undefined) {
    return "";
  }
  const space = generateWhitespace(indent);
  if (description.includes("\n")) {
    return [`${space}/**`]
      .concat(description.split("\n").map((line) => `${space} * ${line}`))
      .concat([`${space} */`])
      .join("\n");
  }
  return `${space}/** ${description} */`;
}

/**
 * 生成缩进的空格
 * @param {number} indent 缩进几次
 * @param {number} size 几个空格
 * @returns
 */
function generateWhitespace(indent: number, size = 2) {
  let i = indent < 0 ? 0 : indent;
  return " ".repeat(i * size);
}
