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
 */
export function jsonSchema2Interface(schema: JSONSchema) {
  const { type, description, title } = schema;
  if (type === JSONSchemaTypes.String) {
    return "string";
  }
  if (type === JSONSchemaTypes.Number) {
    return "number";
  }
  if (type === JSONSchemaTypes.Object) {
    const { properties } = schema;
    Object.keys(properties).map((key) => {
      const { description } = properties[key];
    });
  }
}
