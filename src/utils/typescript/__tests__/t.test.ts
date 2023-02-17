import { describe, test, expect } from "vitest";

/**
 * @typedef {object} AtUser
 * @prop {string} username 用户名称
 * @prop {string} userinfoUri 用户id
 * @prop {number} position 该 at 所在内容的位置？
 *
 * @param {string} content
 * @param {AtUser[]} atList
 */
function parseContent(
  content: string,
  atList: {
    username: string;
    userinfoUri: string;
    position: number;
  }[],
  cursor?: number
) {
  // const atUserStrings = atList.map((user) => `@${user.username}_${user.userinfoUri}`);

  const result = [];

  let i = 0;
  let str = "";
  let maybeEmoji = false;
  let maybeEmojiStart = 0;
  let emojiStr = "";

  function log(...args: unknown[]) {}

  while (i < content.length) {
    const s = content[i];
    log("start", s, str, emojiStr);
    if (s === "@") {
      /** @type {null | object} */
      let matched = null;
      for (let j = 0; j < atList.length; j += 1) {
        const user = atList[j];
        const userStr = `@${user.username}_${user.userinfoUri}`;
        const length = userStr.length;
        if (content.slice(i, i + length) === userStr) {
          matched = {
            index: i,
            length,
            id: user.userinfoUri,
            username: user.username,
          };
          break;
        }
      }
      if (matched) {
        if (str !== "") {
          log("[]is @user, save prev content", str + emojiStr);
          result.push({
            type: 2,
            text: str + emojiStr,
          });
          str = "";
          emojiStr = "";
        }
        maybeEmoji = false;
        result.push({
          type: 1,
          //   index: i,
          id: matched.id,
          username: matched.username,
        });
        i = i + matched.length;
        continue;
      }
    }
    if (s === "[") {
      maybeEmoji = true;
      maybeEmojiStart = i;
      emojiStr += s;
      i += 1;
      continue;
    }
    if (s === "]") {
      if (maybeEmoji) {
        if (str !== "") {
          result.push({
            type: 2,
            text: str,
          });
          str = "";
        }
        emojiStr += s;
        result.push({
          type: 3,
          start: maybeEmojiStart,
          end: i,
          text: emojiStr,
          inCursor: (() => {
            if (!cursor) {
              return false;
            }
            return cursor > maybeEmojiStart && cursor <= i + 1;
          })(),
        });
        maybeEmoji = false;
        maybeEmojiStart = 0;
        emojiStr = "";
        i += 1;
        continue;
      }
    }
    if (maybeEmoji) {
      emojiStr += s;
      i += 1;
      continue;
    }
    str += s;
    i += 1;
  }
  if (str + emojiStr !== "") {
    result.push({
      type: 2,
      text: str + emojiStr,
    });
  }
  return result;
}

function splitArr(arr: string[], size: number) {
  const emojiArr = [];
  let i = 0;
  while (i < Math.ceil(arr.length / size)) {
    const sub = arr.slice(i * size, (i + 1) * size);
    console.log(sub);
    emojiArr.push(sub);
    i += 1;
  }
  return emojiArr;
}

describe("1", () => {
  test("没有 @user", () => {
    const content = "helle 这是一段评论，其中没有 @ 人";
    const result = parseContent(content, []);
    expect(result).toStrictEqual([
      {
        type: 2,
        text: "helle 这是一段评论，其中没有 @ 人",
      },
    ]);
  });

  test("连续 @user 并且在开头", () => {
    const content =
      "@捡漏江湖测试_2203152037tSboec@158****9996_2208251104AunDbOhelle 其中有 @ 人并且内容还和正文连接在了一起";
    const result = parseContent(content, [
      {
        position: 0,
        userinfoUri: "2203152037tSboec",
        username: "捡漏江湖测试",
      },
      {
        position: 36,
        userinfoUri: "2208251104AunDbO",
        username: "158****9996",
      },
    ]);
    expect(result).toStrictEqual([
      {
        type: 1,
        id: "2203152037tSboec",
        username: "捡漏江湖测试",
      },
      {
        type: 1,
        id: "2208251104AunDbO",
        username: "158****9996",
      },
      {
        type: 2,
        text: "helle 其中有 @ 人并且内容还和正文连接在了一起",
      },
    ]);
  });

  test("@ 人穿插在正文中间", () => {
    const content =
      "这是开头@158****9996_2208251104AunDbOhelle 其中有 @ 人并且内容还和正文连接在了一起，这里 @捡漏江湖测试_2203152037tSboec然后是结尾";
    const result = parseContent(content, [
      {
        position: 0,
        userinfoUri: "2203152037tSboec",
        username: "捡漏江湖测试",
      },
      {
        position: 36,
        userinfoUri: "2208251104AunDbO",
        username: "158****9996",
      },
    ]);
    expect(result).toStrictEqual([
      {
        type: 2,
        text: "这是开头",
      },
      {
        type: 1,
        id: "2208251104AunDbO",
        username: "158****9996",
      },
      {
        type: 2,
        text: "helle 其中有 @ 人并且内容还和正文连接在了一起，这里 ",
      },
      {
        type: 1,
        id: "2203152037tSboec",
        username: "捡漏江湖测试",
      },
      {
        type: 2,
        text: "然后是结尾",
      },
    ]);
  });

  test("带表情的", () => {
    const content =
      "这是开头@158****9996_2208251104AunDbOhelle 其中有 @ 人并且内容还和正文连接在了一起，[微笑]这里 @捡漏江湖测试_2203152037tSboec然后是结尾";
    const result = parseContent(content, [
      {
        position: 0,
        userinfoUri: "2203152037tSboec",
        username: "捡漏江湖测试",
      },
      {
        position: 36,
        userinfoUri: "2208251104AunDbO",
        username: "158****9996",
      },
    ]);
    expect(result).toStrictEqual([
      {
        type: 2,
        text: "这是开头",
      },
      {
        type: 1,
        id: "2208251104AunDbO",
        username: "158****9996",
      },
      {
        type: 2,
        text: "helle 其中有 @ 人并且内容还和正文连接在了一起，",
      },
      {
        type: 3,
        start: 61,
        end: 64,
        text: "[微笑]",
        inCursor: false,
      },
      {
        type: 2,
        text: "这里 ",
      },
      {
        type: 1,
        id: "2203152037tSboec",
        username: "捡漏江湖测试",
      },
      {
        type: 2,
        text: "然后是结尾",
      },
    ]);
  });

  test("有像是 @user 和表情包但实际不是的", () => {
    const content =
      "这是开头@158****9996_2208251104AunDb 哈哈哈 [微笑里 @捡漏江湖测试_2203152037tSboec然后是结尾";
    const result = parseContent(content, [
      {
        position: 0,
        userinfoUri: "2203152037tSboec",
        username: "捡漏江湖测试",
      },
      {
        position: 36,
        userinfoUri: "2208251104AunDbO",
        username: "158****9996",
      },
    ]);
    expect(result).toStrictEqual([
      {
        type: 2,
        text: "这是开头@158****9996_2208251104AunDb 哈哈哈 [微笑里 ",
      },
      {
        type: 1,
        id: "2203152037tSboec",
        username: "捡漏江湖测试",
      },
      {
        type: 2,
        text: "然后是结尾",
      },
    ]);
  });

  test("有像是 @user 和表情包但实际不是的", () => {
    const content = "这是开头[表情一半";
    const result = parseContent(content, []);
    expect(result).toStrictEqual([
      {
        type: 2,
        text: "这是开头[表情一半",
      },
    ]);
  });

  test("位置", () => {
    const content = "[微笑]这是正文1[微笑]哈哈";
    const result = parseContent(content, [], 0);
    expect(result).toStrictEqual([
      {
        type: 3,
        start: 0,
        end: 3,
        text: "[微笑]",
        inCursor: false,
      },
      {
        type: 2,
        text: "这是正文1",
      },
      {
        type: 3,
        start: 9,
        end: 12,
        text: "[微笑]",
        inCursor: false,
      },
      {
        type: 2,
        text: "哈哈",
      },
    ]);
  });

  test("位置", () => {
    const content = "[微笑]这是正文1[微笑]哈哈";
    const result = parseContent(content, [], 1);
    expect(result).toStrictEqual([
      {
        type: 3,
        start: 0,
        end: 3,
        text: "[微笑]",
        inCursor: true,
      },
      {
        type: 2,
        text: "这是正文1",
      },
      {
        type: 3,
        start: 9,
        end: 12,
        text: "[微笑]",
        inCursor: false,
      },
      {
        type: 2,
        text: "哈哈",
      },
    ]);
  });

  test("位置", () => {
    const content = "[微笑]这是正文1[微笑]哈哈";
    const result = parseContent(content, [], 4);
    expect(result).toStrictEqual([
      {
        type: 3,
        start: 0,
        end: 3,
        text: "[微笑]",
        inCursor: true,
      },
      {
        type: 2,
        text: "这是正文1",
      },
      {
        type: 3,
        start: 9,
        end: 12,
        text: "[微笑]",
        inCursor: false,
      },
      {
        type: 2,
        text: "哈哈",
      },
    ]);
  });
});

describe("split arr", () => {
  test("1", () => {
    const arr = [
      "微笑",
      "撇嘴",
      "色",
      "发呆",
      "得意",
      "流泪",
      "害羞",
      "闭嘴",
      "睡",
      "大哭",
      "尴尬",
      "发怒",
      "调皮",
      "呲牙",
      "惊讶",
      "难过",
      "酷",
      "冷汗",
      "抓狂",
      "吐",
      "偷笑",
      "愉快",
      "白眼",
      "傲慢",
      "饥饿",
      "困",
      "惊恐",
      "流汗",
      "憨笑",
      "悠闲",
      "奋斗",
      "咒骂",
      "疑问",
      "嘘",
      "晕",
      "疯了",
      "衰",
      "骷髅",
      "敲打",
      "再见",
      "擦汗",
      "抠鼻",
      "鼓掌",
      "糗大了",
      "坏笑",
      "左哼哼",
      "右哼哼",
      "哈欠",
      "鄙视",
      "委屈",
      "快哭了",
      "阴险",
      "亲亲",
      "吓",
      "可怜",
      "玫瑰",
      "握手",
    ];
    const result = splitArr(arr, 21);

    expect(result).toStrictEqual([
      [
        "微笑",
        "撇嘴",
        "色",
        "发呆",
        "得意",
        "流泪",
        "害羞",
        "闭嘴",
        "睡",
        "大哭",
        "尴尬",
        "发怒",
        "调皮",
        "呲牙",
        "惊讶",
        "难过",
        "酷",
        "冷汗",
        "抓狂",
        "吐",
        "偷笑",
      ],
      [
        "愉快",
        "白眼",
        "傲慢",
        "饥饿",
        "困",
        "惊恐",
        "流汗",
        "憨笑",
        "悠闲",
        "奋斗",
        "咒骂",
        "疑问",
        "嘘",
        "晕",
        "疯了",
        "衰",
        "骷髅",
        "敲打",
        "再见",
        "擦汗",
        "抠鼻",
      ],
      [
        "鼓掌",
        "糗大了",
        "坏笑",
        "左哼哼",
        "右哼哼",
        "哈欠",
        "鄙视",
        "委屈",
        "快哭了",
        "阴险",
        "亲亲",
        "吓",
        "可怜",
        "玫瑰",
        "握手",
      ],
    ]);
  });
});

function execBackspace(text: string, position = text.length) {
  const emojis = parseContent(text, [], position).filter((c) => c.type === 3);
  if (emojis.length === 0) {
    return {
      text: text.slice(0, position - 1) + text.slice(position),
      cursor: position - 1,
    };
  }
  let inEmoji = emojis.find((e) => e.inCursor);
  console.log("[]in emojis", inEmoji, emojis);
  if (!inEmoji) {
    return {
      text: text.slice(0, position - 1) + text.slice(position),
      cursor: position - 1,
    };
  }
  return {
    text: text.slice(0, inEmoji.start) + text.slice(inEmoji.end + 1),
    cursor: inEmoji.start,
  };
}

describe("delete", () => {
  test("d", () => {
    const text = "这是一段文本[表情]间隔表情[表情]接着文本";

    const r = execBackspace("这是一段文本", 2);
    expect(r).toStrictEqual({
      text: "这一段文本",
      cursor: 1,
    });

    // 文本#[表情]
    const r1 = execBackspace(text, 6);
    expect(r1).toStrictEqual({
      text: "这是一段文[表情]间隔表情[表情]接着文本",
      cursor: 5,
    });

    // 文本[#表情]
    const r2 = execBackspace(text, 7);
    expect(r2).toStrictEqual({
      text: "这是一段文本间隔表情[表情]接着文本",
      cursor: 6,
    });

    // 文本[表情]#
    const r3 = execBackspace(text, 10);
    expect(r3).toStrictEqual({
      text: "这是一段文本间隔表情[表情]接着文本",
      cursor: 6,
    });

    const r4 = execBackspace("hello", 5);
    expect(r4).toStrictEqual({
      text: "hell",
      cursor: 4,
    });

    const r5 = execBackspace("[标签]", 4);
    expect(r5).toStrictEqual({
      text: "",
      cursor: 0,
    });

    const r6 = execBackspace("[标签][标签", 7);
    expect(r6).toStrictEqual({
      text: "[标签][标",
      cursor: 6,
    });
  });
});
