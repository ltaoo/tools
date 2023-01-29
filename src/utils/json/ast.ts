import {
  isSpaceSeparator,
  isIdStartChar,
  isIdContinueChar,
  isDigit,
  isHexDigit,
} from "./utils";

/** 词法解析阶段 */
type LexState =
  | "default"
  | "comment"
  | "multiLineComment"
  | "singleLineComment"
  | "multiLineCommentAsterisk"
  | "decimalPointLeading"
  | "sign"
  | "zero"
  | "identifierNameEscape"
  | "decimalInteger"
  | "string"
  | "identifierName"
  | "decimalPoint"
  | "decimalExponent"
  | "hexadecimal"
  | "decimalFraction"
  | "decimalExponentSign"
  | "decimalExponentInteger"
  | "hexadecimalInteger"
  | "value"
  | "identifierNameStartEscape";

/** 非词法解析阶段,比如属性开头这类，应该是划分 token 的阶段 */
type ParseState =
  | "start"
  | "beforePropertyName"
  | "afterPropertyName"
  | "beforePropertyValue"
  | "afterPropertyValue"
  | "beforeArrayValue"
  | "afterArrayValue"
  | "multiLineComment"
  | "singleLineComment"
  | "end";

/** 原始 JSON 字符串 */
let source: string;
/** 解析阶段 */
let parseState: ParseState;
/** 保存解析好的 token 数组 */
let stack: AstNode[];
/** 暂存的评论节点 */
let comments: AstNode[] = [];
/** JSON 字符串解析到第几个字符 */
let pos: number;
/** JSON 字符串解析到第几行 */
let line: number;
/** JSON 字符串解析到第几列 */
let column: number;
/** 得到的 token */
let token: Token | undefined;
/** 对象 key */
let key: string | undefined;
/** AST 根节点 */
let root: AstNode | undefined;
let checkHasBreakBetweenPunctuatorAndComment = false;
/** 在 [、{ 符号和 注释间是否存在换行符 */
let hasBreakBetweenPunctuatorAndComment = false;
let bufferBetweenValueAndComment = "";
let isTrailingComment = false;

function log(...args: unknown[]) {
  // console.log(...args);
}

/**
 * 解析 json 字符串
 */
export function parse(text: string, reviver?: boolean) {
  source = String(text);
  parseState = "start";
  stack = [];
  comments = [];
  pos = 0;
  line = 1;
  column = 0;
  token = undefined;
  key = undefined;
  root = undefined;
  checkHasBreakBetweenPunctuatorAndComment = false;
  hasBreakBetweenPunctuatorAndComment = false;
  bufferBetweenValueAndComment = "";
  isTrailingComment = false;

  do {
    token = lex();
    log(
      "[](parse)",
      token,
      lexState,
      parseState,
      bufferBetweenValueAndComment,
      hasBreakBetweenPunctuatorAndComment
    );
    // 遇到 [ 或 { 就开始检测是否存在符号后注释，这种注释，会作为父节点注释
    if (
      token.type === "punctuator" &&
      token.value &&
      ["{", "["].includes(token.value)
    ) {
      hasBreakBetweenPunctuatorAndComment = false;
      checkHasBreakBetweenPunctuatorAndComment = true;
    }
    if (!hasBreakBetweenPunctuatorAndComment) {
      // asLeadingComment 作为父节点的正常注释，兼容 `[ // 注释` 这种场景
      // @ts-ignore
      token.asLeadingComment = true;
    }
    // 每次解析完一个 token 就重置掉 token 和 comment 间的字符，用于判断 token 和 comment 间是否有换行，从而判断出该注释属于行末注释还是正常注释
    if (!["multiLineComment", "singleLineComment"].includes(token.type)) {
      bufferBetweenValueAndComment = "";
    }
    // 但是如果是解析完单行注释，最后一个字符可能是 \n，保存好后，到了这里又被重置，导致后面识别有问题
    parseStates[parseState]();
  } while (token.type !== "eof");
  if (typeof reviver === "function") {
      // @ts-ignore
    return internalize({ "": root }, "", reviver);
  }
  return root;
}

/** 词法解析阶段 */
let lexState: LexState;
/** 暂存的字符串 */
let buffer: string;
/** 是否双引号 */
let doubleQuote: boolean;
let sign: number;
/** 当前字符 */
let c: undefined | string;
let prevParseState: ParseState;

/** 获取当前解析到的字符 code，但不会往前走 */
export function peek() {
  if (source[pos]) {
    return String.fromCodePoint(source.codePointAt(pos)!);
  }
}
/** 读取一个字符串，往前走 n */
function read() {
  const c = peek();
  if (c) {
    pos += c.length;
  }
  if (c === "\n") {
    line++;
    column = 0;
    return c;
  }
  if (c) {
    column += c.length;
    return c;
  }
  column++;
  return c;
}

/**
 * 提取出一个个的 token
 * 内部有死循环，必定能提取出一个 token
 */
function lex(): Token {
  lexState = "default";
  buffer = "";
  doubleQuote = false;
  sign = 1;
  for (;;) {
    c = peek();
    const token = lexStates[lexState]();
    if (token) {
      return token;
    }
  }
}

/** 词法解析器 */
const lexStates: Record<LexState | ParseState, Function> = {
  default() {
    if (c !== undefined) {
      bufferBetweenValueAndComment += c;
    }
    log(
      "[lexStates](default)",
      c,
      parseState,
      bufferBetweenValueAndComment.length
    );
    switch (c) {
      case "\t":
      case "\v":
      case "\f":
      case " ":
      case "\u00A0":
      case "\uFEFF":
      case "\n":
      case "\r":
      case "\u2028":
      case "\u2029":
        // 如果开始解析时就是这些字符，可以跳过
        read();
        return;
      case "/":
        // 注释的开始，但不确定是单行还是多行，所以到 comment() {} 中判断
        buffer += read();
        log(
          "[lexStates](default) - check is comment",
          bufferBetweenValueAndComment,
          checkHasBreakBetweenPunctuatorAndComment,
          hasBreakBetweenPunctuatorAndComment
        );
        if (
          bufferBetweenValueAndComment.includes("\n") &&
          checkHasBreakBetweenPunctuatorAndComment
        ) {
          hasBreakBetweenPunctuatorAndComment = true;
        }
        if (bufferBetweenValueAndComment.includes("\n")) {
          isTrailingComment = false;
        } else {
          isTrailingComment = true;
        }
        lexState = "comment";
        return;
      case undefined:
        read();
        return newToken("eof");
    }
    if (isSpaceSeparator(c)) {
      read();
      return;
    }
    return lexStates[parseState]();
  },
  comment() {
    log("[lexStates](comment)", c, parseState);
    switch (c) {
      case "*":
        // 多行注释
        buffer += read();
        lexState = "multiLineComment";
        return;
      case "/":
        // 单行注释
        buffer += read();
        lexState = "singleLineComment";
        return;
    }
    throw invalidChar(read());
  },
  multiLineComment() {
    // log("[](multiLineComment)", c, lexState, parseState);
    switch (c) {
      case "*":
        buffer += read();
        lexState = "multiLineCommentAsterisk";
        return;
      case undefined:
        throw invalidChar(read());
    }
    buffer += read();
  },
  /** 这里是解析到 * 到这里，如果 / 后面连续多个 * 号，或者多行中间的星号，都会被这里处理掉 */
  multiLineCommentAsterisk() {
    // log("[](multiLineCommentAsterisk)", c, lexState, parseState);
    switch (c) {
      case "*":
        buffer += read();
        return;
      case "/":
        buffer += read();
        const t = newToken("multiLineComment", buffer);
        buffer = "";
        lexState = "default";
        log(
          "[lexStates](multiLineCommentAsterisk)",
          bufferBetweenValueAndComment
        );
        prevParseState = parseState;
        parseState = "multiLineComment";
        return t;
      case undefined:
        throw invalidChar(read());
    }
    buffer += read();
    lexState = "multiLineComment";
  },
  singleLineComment() {
    // log("[lexStates](singleLineComment)", c, parseState);
    switch (c) {
      case "\n":
      case "\r":
      case "\u2028":
      case "\u2029":
        if (c !== undefined) {
          bufferBetweenValueAndComment += c;
        }
        read();
        log(
          "[lexStates](singleLineComment) - check is trailing comment",
          bufferBetweenValueAndComment,
          bufferBetweenValueAndComment.length
        );
        const t = newToken("singleLineComment", buffer);
        buffer = "";
        lexState = "default";
        prevParseState = parseState;
        parseState = "singleLineComment";
        return t;
      case undefined:
        read();
        // 可能 JSON 最后面有注释，表示结束整个解析
        return newToken("eof");
    }
    buffer += read();
  },
  value() {
    log("[lexStates](value)", c);
    // checkHasBreakBetweenPunctuatorAndComment = false;
    switch (c) {
      case "{":
      case "[":
        return newToken("punctuator", read());
      case "n":
        read();
        literal("ull");
        return newToken("null", null);
      case "t":
        read();
        literal("rue");
        return newToken("boolean", true);
      case "f":
        read();
        literal("alse");
        return newToken("boolean", false);
      case "-":
      case "+":
        if (read() === "-") {
          sign = -1;
        }
        lexState = "sign";
        return;
      case ".":
        buffer = read() || "";
        lexState = "decimalPointLeading";
        return;
      case "0":
        buffer = read() || "";
        lexState = "zero";
        return;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        buffer = read() || "";
        lexState = "decimalInteger";
        return;
      case "I":
        read();
        literal("nfinity");
        return newToken("numeric", Infinity);
      case "N":
        read();
        literal("aN");
        return newToken("numeric", NaN);
      case '"':
      case "'":
        log("[](value)", c);
        doubleQuote = read() === '"';
        buffer = "";
        lexState = "string";
        return;
    }
    throw invalidChar(read());
  },
  identifierNameStartEscape() {
    if (c !== "u") {
      throw invalidChar(read());
    }
    read();
    const u = unicodeEscape();
    switch (u) {
      case "$":
      case "_":
        break;
      default:
        if (!isIdStartChar(u)) {
          throw invalidIdentifier();
        }
        break;
    }
    buffer += u;
    lexState = "identifierName";
  },
  identifierName() {
    switch (c) {
      case "$":
      case "_":
      case "\u200C":
      case "\u200D":
        buffer += read();
        return;
      case "\\":
        read();
        lexState = "identifierNameEscape";
        return;
    }
    if (isIdContinueChar(c)) {
      buffer += read();
      return;
    }
    return newToken("identifier", buffer);
  },
  identifierNameEscape() {
    if (c !== "u") {
      throw invalidChar(read());
    }
    read();
    const u = unicodeEscape();
    switch (u) {
      case "$":
      case "_":
      case "\u200C":
      case "\u200D":
        break;
      default:
        if (!isIdContinueChar(u)) {
          throw invalidIdentifier();
        }
        break;
    }
    buffer += u;
    lexState = "identifierName";
  },
  sign() {
    switch (c) {
      case ".":
        buffer = read() || "";
        lexState = "decimalPointLeading";
        return;
      case "0":
        buffer = read() || "";
        lexState = "zero";
        return;
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        buffer = read() || "";
        lexState = "decimalInteger";
        return;
      case "I":
        read();
        literal("nfinity");
        return newToken("numeric", sign * Infinity);
      case "N":
        read();
        literal("aN");
        return newToken("numeric", NaN);
    }
    throw invalidChar(read());
  },
  zero() {
    switch (c) {
      case ".":
        buffer += read();
        lexState = "decimalPoint";
        return;
      case "e":
      case "E":
        buffer += read();
        lexState = "decimalExponent";
        return;
      case "x":
      case "X":
        buffer += read();
        lexState = "hexadecimal";
        return;
    }
    return newToken("numeric", sign * 0);
  },
  decimalInteger() {
    switch (c) {
      case ".":
        buffer += read();
        lexState = "decimalPoint";
        return;
      case "e":
      case "E":
        buffer += read();
        lexState = "decimalExponent";
        return;
    }
    if (isDigit(c)) {
      buffer += read();
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  decimalPointLeading() {
    if (isDigit(c)) {
      buffer += read();
      lexState = "decimalFraction";
      return;
    }
    throw invalidChar(read());
  },
  decimalPoint() {
    switch (c) {
      case "e":
      case "E":
        buffer += read();
        lexState = "decimalExponent";
        return;
    }
    if (isDigit(c)) {
      buffer += read();
      lexState = "decimalFraction";
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  decimalFraction() {
    switch (c) {
      case "e":
      case "E":
        buffer += read();
        lexState = "decimalExponent";
        return;
    }
    if (isDigit(c)) {
      buffer += read();
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  decimalExponent() {
    switch (c) {
      case "+":
      case "-":
        buffer += read();
        lexState = "decimalExponentSign";
        return;
    }
    if (isDigit(c)) {
      buffer += read();
      lexState = "decimalExponentInteger";
      return;
    }
    throw invalidChar(read());
  },
  decimalExponentSign() {
    if (isDigit(c)) {
      buffer += read();
      lexState = "decimalExponentInteger";
      return;
    }
    throw invalidChar(read());
  },
  decimalExponentInteger() {
    if (isDigit(c)) {
      buffer += read();
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  hexadecimal() {
    if (isHexDigit(c)) {
      buffer += read();
      lexState = "hexadecimalInteger";
      return;
    }
    throw invalidChar(read());
  },
  hexadecimalInteger() {
    if (isHexDigit(c)) {
      buffer += read();
      return;
    }
    return newToken("numeric", sign * Number(buffer));
  },
  string() {
    // log("[lexStates](string)", c);
    switch (c) {
      case "\\":
        read();
        buffer += escape();
        return;
      case '"':
        if (doubleQuote) {
          read();
          return newToken("string", buffer);
        }
        buffer += read();
        return;
      case "'":
        if (!doubleQuote) {
          read();
          return newToken("string", buffer);
        }
        buffer += read();
        return;
      case "\n":
      case "\r":
        throw invalidChar(read());
      case "\u2028":
      case "\u2029":
        separatorChar(c);
        break;
      case undefined:
        throw invalidChar(read());
    }
    buffer += read();
  },
  /** 当 default 执行完成后，就会到这里，表示跳过前面的空白字符，真正开始解析了？中途如果解析到 [、{ 并不会调用这里 */
  start() {
    log("[lexStates](start)", c);
    switch (c) {
      case "{":
      case "[":
        return newToken("punctuator", read());
    }
    lexState = "value";
  },
  beforePropertyName() {
    log("[lexStates](beforePropertyValue)", c);
    // checkHasBreakBetweenPunctuatorAndComment = false;
    switch (c) {
      case "$":
      case "_":
        buffer = read() || "";
        lexState = "identifierName";
        return;
      case "\\":
        read();
        lexState = "identifierNameStartEscape";
        return;
      case "}":
        return newToken("punctuator", read());
      case '"':
      case "'":
        doubleQuote = read() === '"';
        lexState = "string";
        return;
    }
    if (isIdStartChar(c)) {
      buffer += read();
      lexState = "identifierName";
      return;
    }
    throw invalidChar(read());
  },
  afterPropertyName() {
    if (c === ":") {
      return newToken("punctuator", read());
    }
    throw invalidChar(read());
  },
  beforePropertyValue() {
    log("[lexStates](beforePropertyValue)", c);
    lexState = "value";
  },
  afterPropertyValue() {
    log("[lexStates](afterPropertyValue)", c);
    switch (c) {
      case ",":
      case "}":
        return newToken("punctuator", read());
    }
    throw invalidChar(read());
  },
  beforeArrayValue() {
    if (c === "]") {
      return newToken("punctuator", read());
    }
    lexState = "value";
  },
  afterArrayValue() {
    log("[lexStates](afterArrayValue)", c);
    switch (c) {
      case ",":
      case "]":
        return newToken("punctuator", read());
    }
    throw invalidChar(read());
  },
  end() {
    throw invalidChar(read());
  },
};

type TokenType =
  | "punctuator"
  | "string"
  | "eof"
  | "null"
  | "boolean"
  | "numeric"
  | "identifier"
  | "multiLineComment"
  | "singleLineComment";
interface Token {
  type: TokenType;
  value?: string;
  line: number;
  column: number;
}
/** 创建一个 token */
function newToken(type: TokenType, value?: string | number | boolean | null) {
  const token = {
    type,
    value,
    line,
    column,
  } as Token;
  return token;
}

function literal(s: string) {
  for (const c of s) {
    const p = peek();
    if (p !== c) {
      throw invalidChar(read());
    }
    read();
  }
}

function escape() {
  const c = peek();
  switch (c) {
    case "b":
      read();
      return "\b";
    case "f":
      read();
      return "\f";
    case "n":
      read();
      return "\n";
    case "r":
      read();
      return "\r";
    case "t":
      read();
      return "\t";
    case "v":
      read();
      return "\v";
    case "0":
      read();
      if (isDigit(peek())) {
        throw invalidChar(read());
      }
      return "\0";
    case "x":
      read();
      return hexEscape();
    case "u":
      read();
      return unicodeEscape();
    case "\n":
    case "\u2028":
    case "\u2029":
      read();
      return "";
    case "\r":
      read();
      if (peek() === "\n") {
        read();
      }
      return "";
    case "1":
    case "2":
    case "3":
    case "4":
    case "5":
    case "6":
    case "7":
    case "8":
    case "9":
      throw invalidChar(read());
    case undefined:
      throw invalidChar(read());
  }
  return read();
}

function hexEscape() {
  let buffer = "";
  let c = peek();

  if (!isHexDigit(c)) {
    throw invalidChar(read());
  }
  buffer += read();
  c = peek();
  if (!isHexDigit(c)) {
    throw invalidChar(read());
  }
  buffer += read();
  return String.fromCodePoint(parseInt(buffer, 16));
}
function unicodeEscape() {
  let buffer = "";
  let count = 4;
  while (count-- > 0) {
    const c = peek();
    if (!isHexDigit(c)) {
      throw invalidChar(read());
    }
    buffer += read();
  }
  return String.fromCodePoint(parseInt(buffer, 16));
}

/** 确定哪种 token 后，开始合成 token？ */
const parseStates: Record<ParseState, Function> = {
  start() {
    if (token?.type === "eof") {
      throw invalidEOF();
    }
    push();
  },
  beforePropertyName() {
    log("[parseStates](beforePropertyValue)", token);
    switch (token?.type) {
      case "identifier":
      case "string":
        // 在取字段值之前，先暂存一下 key，待会取好字段值后，就能组成键值对了
        key = token.value;
        parseState = "afterPropertyName";
        return;
      case "punctuator":
        pop();
        return;
      case "eof":
        throw invalidEOF();
    }
  },
  afterPropertyName() {
    if (token?.type === "eof") {
      throw invalidEOF();
    }
    parseState = "beforePropertyValue";
  },
  beforePropertyValue() {
    log("[parseStates](beforePropertyValue)", token);
    if (token?.type === "eof") {
      throw invalidEOF();
    }
    push();
  },
  afterPropertyValue() {
    log("[parseStates](afterPropertyValue)", token);
    if (token?.type === "eof") {
      throw invalidEOF();
    }
    switch (token?.value) {
      case ",":
        parseState = "beforePropertyName";
        return;
      case "}":
        pop();
    }
  },
  beforeArrayValue() {
    if (token?.type === "eof") {
      throw invalidEOF();
    }
    if (token?.type === "punctuator" && token.value === "]") {
      pop();
      return;
    }
    push();
  },
  afterArrayValue() {
    if (token?.type === "eof") {
      throw invalidEOF();
    }
    switch (token?.value) {
      case ",":
        parseState = "beforeArrayValue";
        return;
      case "]":
        pop();
    }
  },
  multiLineComment() {
    // log("[](multiLineComment)", token);
    if (token?.type === "eof") {
      throw invalidEOF();
    }
    push();
  },
  singleLineComment() {
    // log("[](multiLineComment)", token);
    if (token?.type === "eof") {
      throw invalidEOF();
    }
    push();
  },
  end() {},
};

export enum NodeTypes {
  /** 对象 */
  Object,
  /** 数组 */
  Array,
  /** 字面量 */
  Literal,
  /** 键 */
  Identifier,
  /** 对象键值对 */
  Property,
  /** 多行注释 */
  MultiLineComment,
  /** 单行注释 */
  SingleLineComment,
}
export type AstNode =
  | {
      type: NodeTypes.Object;
      children: AstNode[];
    }
  | {
      type: NodeTypes.Array;
      children: AstNode[];
    }
  | {
      type: NodeTypes.Property;
      key: AstNode;
      value: AstNode;
      leadingComments: AstNode[];
      trailingComments: AstNode[];
    }
  | {
      type: NodeTypes.Identifier;
      value: string;
      raw: string;
    }
  | {
      type: NodeTypes.Literal;
      value: string;
      raw: string;
      leadingComments: AstNode[];
      trailingComments: AstNode[];
    }
  | {
      type: NodeTypes.MultiLineComment;
      text: string;
    }
  | {
      type: NodeTypes.SingleLineComment;
      text: string;
    };
/** 这个 push 的含义是往 ast 里面添加节点 */
function push() {
  if (token === undefined) {
    return;
  }
  let value: AstNode;
  switch (token.type) {
    case "punctuator":
      switch (token.value) {
        case "{":
          value = {
            type: NodeTypes.Object,
            children: [],
          };
          break;
        case "[":
          value = {
            type: NodeTypes.Array,
            children: [],
          };
          break;
      }
      break;
    case "null":
    case "boolean":
    case "numeric":
    case "string":
      // log("[](push) literal value", token, comments, isTrailingComment);
      value = {
        type: NodeTypes.Literal,
        value: token.value!,
        raw: String(token.value),
        leadingComments: [],
        trailingComments: [],
      };
      break;
    case "multiLineComment":
      value = {
        type: NodeTypes.MultiLineComment,
        text: token.value!,
      };
      break;
    case "singleLineComment":
      value = {
        type: NodeTypes.SingleLineComment,
        text: token.value!,
      };
      break;
  }
  log("[](push) - before merge", token, stack, parseState);
  if (root === undefined) {
    // @ts-ignore
    root = value;
  } else {
    const parent = stack[stack.length - 1];
    if (
      [NodeTypes.MultiLineComment, NodeTypes.SingleLineComment].includes(
        // @ts-ignore
        value.type
      )
    ) {
      // 这里是评论
    } else {
      if (parent.type === NodeTypes.Array) {
        if (comments.length !== 0) {
          // @ts-ignore
          value.leadingComments = comments;
          comments = [];
        }
        // @ts-ignore
        parent.children.push(value);
      } else {
        // log("[](push) add object property");
        // @ts-ignore
        parent.children.push({
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: key!,
            raw: String(key!),
          },
          // @ts-ignore
          value,
          leadingComments: comments,
          trailingComments: [],
        });
        comments = [];
      }
    }
  }
  // @ts-ignore
  if ([NodeTypes.Object, NodeTypes.Array].includes(value.type)) {
    // @ts-ignore
    stack.push(value);
    // @ts-ignore
    if (value.type === NodeTypes.Array) {
      log("[](push)", 6);
      parseState = "beforeArrayValue";
    } else {
      log("[](push)", 7);
      parseState = "beforePropertyName";
    }
  } else if (
    [NodeTypes.MultiLineComment, NodeTypes.SingleLineComment].includes(
      // @ts-ignore
      value.type
    )
  ) {
    parseState = prevParseState;
    // @ts-ignore
    comments.push(value);
    const current = stack[stack.length - 1];
    log(
      "[]() how process comment and comments",
      current,
      comments,
      isTrailingComment
    );
    if (
      current.type === NodeTypes.Object &&
      comments.length !== 0 &&
      isTrailingComment
    ) {
      const properties = current.children;
      // 如果当前的对象还没有任何键值对，考虑不作为第一个键值对的注释，而是该对象所属的键值对的注释。兼容 `{ // 这是注释`  的场景
      if (properties.length === 0) {
        const parent = stack[stack.length - 2];
        if (parent && parent.type === NodeTypes.Object) {
          const parentProperties = parent.children;
          const lastParentProperty =
            parentProperties[parentProperties.length - 1];
          if (lastParentProperty) {
            // @ts-ignore
            lastParentProperty.trailingComments =
              // @ts-ignore
              lastParentProperty.trailingComments.concat(comments);
            comments = [];
          }
        }
      }
      const latestProperty = properties[properties.length - 1];
      if (latestProperty) {
        // @ts-ignore
        latestProperty.trailingComments =
          // @ts-ignore
          latestProperty.trailingComments.concat(comments);
        comments = [];
      }
    }
    // 数组元素值增加行末注释
    if (current.type === NodeTypes.Array && comments.length !== 0) {
      const properties = current.children;

      // 如果当前的数组还没有任何键值对。兼容 `[ // 这是注释`  的场景
      // @ts-ignore
      if (properties.length === 0 && token.asLeadingComment) {
        const parent = stack[stack.length - 2];
        if (parent && parent.type === NodeTypes.Object) {
          const parentProperties = parent.children;
          const lastParentProperty =
            parentProperties[parentProperties.length - 1];
          if (lastParentProperty) {
            // @ts-ignore
            lastParentProperty.trailingComments =
              // @ts-ignore
              lastParentProperty.trailingComments.concat(comments);
            comments = [];
          }
        }
      }

      const latestProperty = properties[properties.length - 1];
      if (latestProperty && comments.length !== 0 && isTrailingComment) {
        // @ts-ignore
        latestProperty.trailingComments =
          // @ts-ignore
          latestProperty.trailingComments.concat(comments);
        comments = [];
      }
    }
  } else {
    const current = stack[stack.length - 1];
    if (current == null) {
      log("[](push)", 8);
      parseState = "end";
    } else if (current.type === NodeTypes.Array) {
      log("[](push)", 9);
      parseState = "afterArrayValue";
    } else {
      log("[](push)", 10);
      parseState = "afterPropertyValue";
    }
  }
  // log("[](push) - after set stack", stack);
}

function pop() {
  stack.pop();
  const current = stack[stack.length - 1];
  if (current == null) {
    parseState = "end";
  } else if (current.type === NodeTypes.Array) {
    parseState = "afterArrayValue";
  } else {
    parseState = "afterPropertyValue";
  }
}

/** 内部化？ */
function internalize(
  holder: Record<string, Record<string, unknown>>,
  name: string,
  reviver: Function
) {
  const value = holder[name];
  if (value != null && typeof value === "object") {
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        const key = String(i);
        // @ts-ignore
        const replacement = internalize(value, key, reviver);
        if (replacement === undefined) {
          delete value[key];
        } else {
          Object.defineProperty(value, key, {
            value: replacement,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
    } else {
      for (const key in value) {
        // @ts-ignore
        const replacement = internalize(value, key, reviver);
        if (replacement === undefined) {
          delete value[key];
        } else {
          Object.defineProperty(value, key, {
            value: replacement,
            writable: true,
            enumerable: true,
            configurable: true,
          });
        }
      }
    }
  }

  return reviver.call(holder, name, value);
}

/** 构建一个违反 JSON 解析的字符错误 */
function invalidChar(c: unknown) {
  if (c === undefined) {
    return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
  }
  return syntaxError(
    `JSON5: invalid character '${formatChar(c as string)}' at ${line}:${column}`
  );
}
/** 构建一个违反 JSON 解析的结尾错误 */
function invalidEOF() {
  return syntaxError(`JSON5: invalid end of input at ${line}:${column}`);
}
/** 构建一个违反 JSON 解析的字符错误 */
function invalidIdentifier() {
  column -= 5;
  return syntaxError(
    `JSON5: invalid identifier character at ${line}:${column}`
  );
}
function separatorChar(c: string) {
  console.warn(
    `JSON5: '${formatChar(
      c
    )}' in strings is not valid ECMAScript; consider escaping`
  );
}
function formatChar(c: string) {
  const replacements: Record<string, string> = {
    "'": "\\'",
    '"': '\\"',
    "\\": "\\\\",
    "\b": "\\b",
    "\f": "\\f",
    "\n": "\\n",
    "\r": "\\r",
    "\t": "\\t",
    "\v": "\\v",
    "\0": "\\0",
    "\u2028": "\\u2028",
    "\u2029": "\\u2029",
  };
  if (replacements[c]) {
    return replacements[c];
  }
  if (c < " ") {
    const hexString = c.charCodeAt(0).toString(16);
    return "\\x" + ("00" + hexString).substring(hexString.length);
  }
  return c;
}

/**
 * JSON 解析过程中出现的语法错误
 */
class JSONSyntaxError extends SyntaxError {
  lineNumber: number;
  columnNumber: number;

  constructor(msg: string) {
    super(msg);

    this.lineNumber = -1;
    this.columnNumber = -1;
  }
}
function syntaxError(message: string) {
  const err = new JSONSyntaxError(message);
  err.lineNumber = line;
  err.columnNumber = column;
  return err;
}
