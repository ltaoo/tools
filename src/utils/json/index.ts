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
      const isMultiple = text[1] === "*";
      if (!isMultiple) {
        return text.replace(/\/\//, "").trim();
      }
    })
    .join("\n");
  return description;
}

/**
 * 从多行注释中提取注释
 */
export function extraContentFromMultipleComments(comment) {
  const regexp = /[^\*]{0,}[^\n]{1,}\n/gm;
  const lines = comment.match(regexp);
  console.log(lines);
  return lines
    .map((line) => {
      const matched = line.match(/\*{0,}([^\*\n]{1,})\n/);
      if (matched) {
        return matched[1].trim();
      }
      return null;
    })
    .filter(Boolean);
}
