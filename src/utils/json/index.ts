/**
 * ast 树生成 json schema
 */
import { AstNode, NodeTypes } from "./ast";

/**
 * 检查多个 ast 类型是否一致
 */
function isSameType(astList: AstNode[]) {
  if (astList.length === 0) {
    return true;
  }
  if (astList.length === 1) {
    return true;
  }
  const first = astList[0];
  const { type } = first;
  return astList.slice(1).some((node) => {
    node.type !== type;
  });
}

export function toJSONSchema(ast: AstNode) {
  const { type } = ast;
  if (type === NodeTypes.Object) {
    const { children } = ast;
    const node = {
      type: "object",
      properties: children.map(toJSONSchema).reduce((prev, total) => {
        return {
          ...prev,
          ...total,
        };
      }, {}),
    };
    const description = getDescription(ast);
    if (description) {
      node.description = description;
    }
    return node;
  }
  if (type === NodeTypes.Array) {
    const { children } = ast;
    const childrenIsSameType = isSameType(children);
    const node = {
      type: "array",
      items: (() => {
        if (!childrenIsSameType) {
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
    const description = getDescription(ast);
    if (description) {
      node.description = description;
    }
    return node;
  }
  if (type === NodeTypes.Property) {
    const { key, value } = ast;
    const node = {
      [key.value]: {
        ...toJSONSchema(value),
      },
    };
    const description = getDescription(ast);
    if (description) {
      node.description = description;
    }
    return node;
  }
  if (type === NodeTypes.Literal) {
    const node = {
      type: typeof ast.value,
    };
    const description = getDescription(ast);
    if (description) {
      node.description = description;
    }
    return node;
  }
  return null;
}

function getDescription(ast: AstNode) {
  const { leadingComments = [], trailingComments = [] } = ast;
  const description = leadingComments
    .concat(trailingComments)
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
  const isMultiple = comment.slice(0, 3) === "/*";
  if (isMultiple) {
    return extraContentFromMultipleComments(comment).join("\n");
  }
  return extraContentFromSingleComments(comment);
}
