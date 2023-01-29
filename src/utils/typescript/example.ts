import {
  ConverterLifetimes,
  generateArrayItemName,
  generateWhitespace,
  JSONSchema,
  jsonSchema2Interface,
  jsonSchema2JSDoc,
  JSONSchemaTypes,
  lowerFirstCase,
  TypeNodePlugin,
} from ".";
import { DEFAULT_ROOT_KEY } from "./constants";

function printSchema(schema: JSONSchema, parentKey: string): string[] {
  // console.log('[]()printSchema', schema);
  const { type } = schema;
  if (type === JSONSchemaTypes.Object) {
    const { properties } = schema;
    const extraLines = Object.keys(properties)
      .map((key) => {
        const child = properties[key];
        return printSchema(child, key);
      })
      .reduce((prev, cur) => {
        return prev.concat(cur);
      }, [] as string[]);
    if (Object.keys(properties).length <= 5) {
      const propertyKeys = Object.keys(properties)
        .map((key) => {
          return key;
        })
        .join(", ");
      const line = `const { ${propertyKeys} } = ${parentKey};`;
      //     console.log("[](printSchema) - lines of properties", line, extraLines);
      return [line].concat(extraLines);
    }
    const propertyKeys = Object.keys(properties).map((key) => {
      return `${generateWhitespace(1)}${key},`;
    });
    const line = ["const {", ...propertyKeys, `} = ${parentKey};`];
    //     console.log("[](printSchema) - lines of properties", line, extraLines);
    return line.concat(extraLines);
  }
  if (type === JSONSchemaTypes.Array) {
    const { items } = schema;
    if (Array.isArray(items)) {
      const codes = items
        .map((item, i) => {
          const code = printSchema(
            item,
            lowerFirstCase(generateArrayItemName(i, [""]))
          );
          return code;
        })
        .reduce((prev, cur) => {
          return prev.concat(cur);
        }, [] as string[]);
      const arrKeys = items
        .map((_, i) => {
          return lowerFirstCase(generateArrayItemName(i, [""]));
        })
        .join(", ");
      return [`const [${arrKeys}] = ${parentKey};`].concat(codes);
    }
    const childKey = `${parentKey}Item`;
    const v = printSchema(items, childKey);
    // console.log("[](build)", v);
    return [
      `${parentKey}.map((${childKey}) => {`,
      ...v.map((vv) => {
        return generateWhitespace(1) + vv;
      }),
      "});",
    ];
  }
  return [];
}

/**
 * 构建使用 interface 或 jsdoc 的示例代码
 * @param schema
 */
export function buildExampleCode(
  schema: JSONSchema,
  options: Partial<{
    rootKey: string;
    language: "ts" | "js";
    lifetimes: ConverterLifetimes;
  }> = {}
) {
  const { rootKey = DEFAULT_ROOT_KEY, language = "ts", lifetimes } = options;
  const exampleCode = printSchema(schema, "resp").map((line) => {
    return generateWhitespace(1) + line;
  });
  const generatedCode =
    language === "ts"
      ? jsonSchema2Interface(schema, [rootKey], lifetimes)
      : jsonSchema2JSDoc(schema, [rootKey], lifetimes);

  const codes = [
    generatedCode,
    "",
    "/**",
    ` * @param${(() => {
      if (language === "ts") {
        return "";
      }
      return ` {${rootKey}}`;
    })()} resp`,
    " */",
    `function print(resp${(() => {
      if (language === "ts") {
        return `: ${rootKey}`;
      }
      return "";
    })()}) {`,
    ...exampleCode,
    "}",
  ];
  return codes.join("\n");
}
