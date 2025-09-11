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
            lowerFirstCase(generateArrayItemName(i, [""])),
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
  }> = {},
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

export function buildGolangExampleCode(
  schema: JSONSchema,
  options: Partial<{
    rootKey: string;
    language: "ts" | "js";
    lifetimes: ConverterLifetimes;
  }> = {},
) {
  return jsonSchemaToGoStruct(schema, "GeneratedStruct");
}

function jsonSchemaToGoStruct(
  schema: JSONSchema,
  structName = "GeneratedStruct",
) {
  // console.log(schema);
  // let go_code = `type ${structName} struct {\n`;
  // if (schema.type !== "object") {
  //   return `// Schema is not an object type\ntype ${structName} ${mapType(
  //     schema
  //   )}`;
  // }
  // const requiredFields = schema.required || [];
  // for (const [propertyName, propertySchema] of Object.entries(
  //   schema.properties || {}
  // )) {
  //   const isRequired = requiredFields.includes(propertyName);
  //   const fieldName = toPascalCase(propertyName);
  //   const fieldType = mapType(propertySchema);
  //   const jsonTag = `\`json:"${propertyName}${
  //     isRequired ? "" : ",omitempty"
  //   }"\``;
  //   go_code += `  ${fieldName} ${fieldType} ${jsonTag}\n`;
  // }
  // go_code += "}";
  // return go_code;
  const lines: string[] = [];
  // mapType(schema, "Root", 1, (v: string[]) => {
  //   lines.push(...v);
  // });
  mapType("", schema, "Root", 1, lines);

  return lines.join("\n");
}
function underscoreToUpperCamelCase(str: string) {
  if (!str || typeof str !== "string") {
    return str;
  }

  return str
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join("");
}
function isUpperChar(char: string) {
  return char >= "A" && char <= "Z";
}
function mapType(
  key: string,
  schema: JSONSchema,
  name = "",
  indent = 0,
  lines: string[],
  // callback: (v: string[]) => void
): string {
  // if (schema.$ref) {
  //   return schema.$ref.split("/").pop();
  // }

  // if (schema.enum) {
  //   return "string"; // Could be more sophisticated with iota for known enums
  // }

  switch (schema.type) {
    case "string":
      // if (schema.format === "date-time") return "time.Time";
      // callback(["string"]);
      return "string";
    // case "integer":
    //   return "int";
    case "number":
      // callback(["float64"]);
      return "int";
    case "boolean":
      // callback(["bool"]);
      return "bool";
    case "array":
      // lines.unshift(`[]${mapType(schema.items, name, indent + 1, lines)}`);
      // return "";
      return `[]${mapType(
        key,
        (() => {
          if (Array.isArray(schema.items)) {
            return schema.items[0];
          }
          return schema.items;
        })(),
        name,
        indent + 1,
        lines,
      )}`;
    case "object":
      if (schema.properties) {
        const keys = Object.keys(schema.properties);
        const vvv = keys.map((k) => {
          const struct_name = underscoreToUpperCamelCase(k);
          const tt = mapType(
            k,
            schema.properties[k],
            struct_name,
            indent + 1,
            lines,
          );
          const fixed_struct_name = (() => {
            // 本来是想去掉表示复数的 s 结尾，但是会有 Status 这种单词，去掉就完全错误了
            // const first_char = tt[0];
            // const last_char = tt[tt.length - 1];
            // if (isUpperChar(first_char) && last_char === "s") {
            //   return tt.slice(0, -1);
            // }
            return tt;
          })();
          return `${struct_name} ${fixed_struct_name} \`json:"${k}"\``;
        });
        // const valueType = mapType(schema.additionalProperties);
        if (name) {
          const the_struct = [
            `type ${name} struct {`,
            ...vvv.map((l) => `${" ".repeat(indent + 1)}${l}`),
            "}",
          ];
          lines.unshift(...the_struct);
          return name;
        }
        return `map[string]struct {\n${vvv}\n${" ".repeat(indent)}}`;
      }
      return "interface{}"; // For anonymous objects
    default:
      return "interface{}";
  }
}

function toPascalCase(str: string) {
  return str.replace(/(^\w|_\w)/g, (match) =>
    match.replace(/_/, "").toUpperCase(),
  );
}
