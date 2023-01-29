/**
 * ast 树生成 json schema
 * @todo 数组元素是对象，但是第一个对象的 a 和第二个对象的 a 的值不同，需要支持这种情况
 */
import { AstNode, NodeTypes } from "./ast";

/**
 * 检查多个 ast 类型是否一致
 */
function isNotSameType(astList: AstNode[]) {
  if (astList.length === 0) {
    return false;
  }
  if (astList.length === 1) {
    return false;
  }
  const first = astList[0];
  // console.log("[](isSameType)", first, astList.slice(1));
  return astList.slice(1).some((node) => {
    const { type } = node;
    const { type: firstType } = first;
    if (firstType === NodeTypes.Object) {
      if (type === NodeTypes.Object) {
        return false;
      }
      return true;
    }
    if (firstType === NodeTypes.Array) {
      if (type === NodeTypes.Array) {
        return false;
      }
      return true;
    }
    if (firstType === NodeTypes.Literal) {
      if (type === NodeTypes.Literal) {
        return typeof node.value !== typeof first.value;
      }
      return true;
    }
    return true;
  });
}

// @ts-ignore
export function toJSONSchema(ast: AstNode) {
  const { type } = ast;
  if (type === NodeTypes.Object) {
    const { children } = ast;
    // @ts-ignore
    const node = {
      type: "object",
      properties: children.map(toJSONSchema).reduce((prev, total) => {
        return {
          ...prev,
          ...total,
        };
      }, {}),
    };
    // const description = getDescription(ast);
    // if (description) {
    //   node.description = description;
    // }
    return node;
  }
  if (type === NodeTypes.Array) {
    const { children } = ast;
    const childrenIsNotSameType = isNotSameType(children);
    // console.log("[](toJSONSchema) - array", children, childrenIsNotSameType);
    // @ts-ignore
    const node = {
      type: "array",
      // @ts-ignore
      items: (() => {
        if (childrenIsNotSameType) {
          return children.map(toJSONSchema);
        }
        if (children.length === 0) {
          return {
            type: "unknown",
          };
        }
        return toJSONSchema(children[0]);
      })(),
    };
    // const description = getDescription(ast);
    // if (description) {
    //   node.description = description;
    // }
    return node;
  }
  if (type === NodeTypes.Property) {
    const { key, value } = ast;
    // @ts-ignore
    const node = {
      // @ts-ignore
      [key.value]: {
        ...toJSONSchema(value),
      },
    };
    const description = getDescription(ast);
    if (description) {
      // @ts-ignore
      node[key.value].description = description;
    }
    return node;
  }
  if (type === NodeTypes.Literal) {
    const node = {
      type: (() => {
        if (ast.value === null) {
          return "null";
        }
        return typeof ast.value;
      })(),
    };
    // const description = getDescription(ast);
    // if (description) {
    //   node.description = description;
    // }
    return node;
  }
  return null;
}

function getDescription(ast: AstNode) {
  // @ts-ignore
  const { leadingComments = [], trailingComments = [] } = ast;
  const description = leadingComments
    .concat(trailingComments)
    // @ts-ignore
    .map((comment) => {
      const { text } = comment;
      const c = extraContentFromComments(text);
      return c;
    })
    .filter(Boolean)
    .join("\n");
  return description;
}

/**
 * 从多行注释中提取注释
 */
export function extraContentFromMultipleComments(comment: string) {
  const result: string[] = [];
  let i = 2;
  let content = "";
  let isNewLine = false;
  while (i < comment.length) {
    const s = comment[i];
    // console.log("[extra] - loop", i, s);
    if (s === "\n") {
      isNewLine = true;
      if (content) {
        result.push(content);
        content = "";
      }
      i += 1;
      continue;
    }
    if (s === "*") {
      if (comment[i + 1] === "/") {
        if (content) {
          result.push(content);
          content = "";
        }
        i += 2;
      }
      if (comment[i - 1] === "*") {
        i += 1;
        continue;
      }
      if (isNewLine) {
        i += 1;
        continue;
      }
    }
    if (s === " ") {
      if (isNewLine) {
        i += 1;
        continue;
      }
    }
    if (s === "\t") {
      if (isNewLine) {
        i += 1;
        continue;
      }
    }
    // console.log("[extra]save content", isNewLine, content);
    isNewLine = false;
    content += s;
    i += 1;
  }
  // 开头存在空白 + 正文 或 结尾存在空白 + 正文 时，提取到的正文会包含空格，上面不好处理，所以这里额外处理下
  return result.map((line) => {
    return line.trim();
  });
}

/**
 * 从单行注释提取正文
 */
export function extraContentFromSingleComments(comment: string) {
  let i = 0;
  let c = "";
  // 是否开始解析
  let f = true;
  // 是否开始准备解析正文
  let isStart = false;
  while (i < comment.length) {
    let s = comment[i];
    if (s === "/") {
      if (comment[i + 1] === "/" && f) {
        isStart = true;
        f = false;
        i += 2;
        continue;
      }
    }
    if (s === " ") {
      if (isStart) {
        i += 1;
        continue;
      }
    }
    if (s === "\n") {
      return c;
    }
    isStart = false;
    c += s;
    i += 1;
  }
  return c;
}

/**
 * 从注释提取正文
 */
export function extraContentFromComments(comment: string) {
  if (!comment) {
    return "";
  }
  if (typeof comment !== "string") {
    return "";
  }
  if (comment.length < 3) {
    return "";
  }
  const isMultiple = comment.slice(0, 2) === "/*";
  if (isMultiple) {
    return extraContentFromMultipleComments(comment).join("\n");
  }
  return extraContentFromSingleComments(comment);
}
