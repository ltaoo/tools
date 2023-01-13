import { describe, test, expect } from "vitest";

import { parse } from "../ast";
import { extraContentFromComments, toJSONSchema } from "..";

describe("json 转 json schema", () => {
  test("根节点为对象且只包含简单类型数据，行末注释", () => {
    const json = `{
	"name": "ltaoo", // 姓名
	"age": 18 // 年龄
}`;
    const scheme = toJSONSchema(parse(json));
    expect(scheme).toStrictEqual({
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "姓名",
        },
        age: {
          type: "number",
          description: "年龄",
        },
      },
    });
  });

  test("根节点为对象且只包含简单类型数据，多行注释", () => {
    const json = `{
	/**
	 * 姓名
	 */
	"name": "ltaoo",
	/**
	 * 年龄
	 */
	"age": 18
}`;
    const scheme = toJSONSchema(parse(json));
    expect(scheme).toStrictEqual({
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "姓名",
        },
        age: {
          type: "number",
          description: "年龄",
        },
      },
    });
  });

  test("复杂数据类型，单行注释", () => {
    const json = `{
	"name": "ltaoo", // 姓名
	"records": { // 记录
		"win": "now", // 胜利记录
	},
	"habits": ["eat"], // 习惯
}`;
    const scheme = toJSONSchema(parse(json));
    expect(scheme).toStrictEqual({
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "姓名",
        },
        records: {
          type: "object",
          properties: {
            win: {
              type: "string",
              description: "胜利记录",
            },
          },
          description: "记录",
        },
        habits: {
          type: "array",
          items: {
            type: "string",
          },
          description: "习惯",
        },
      },
    });
  });

  test("数组内相同类型", () => {
    const json = `{
	"names": [
    "test",
    "hello"
  ]
}`;
    const scheme = toJSONSchema(parse(json));
    expect(scheme).toStrictEqual({
      type: "object",
      properties: {
        names: {
          type: "array",
          items: {
            type: "string",
          },
        },
      },
    });
  });

  test("数组内存在多种类型", () => {
    const json = `{
	"names": [
    "test",
    18,
    true,
    {
      "hello": "world",
    },
    ["haha"]
  ]
}`;
    const scheme = toJSONSchema(parse(json));
    expect(scheme).toStrictEqual({
      type: "object",
      properties: {
        names: {
          type: "array",
          items: [
            {
              type: "string",
            },
            {
              type: "number",
            },
            {
              type: "boolean",
            },
            {
              type: "object",
              properties: {
                hello: {
                  type: "string",
                },
              },
            },
            {
              type: "array",
              items: {
                type: "string",
              },
            },
          ],
        },
      },
    });
  });
});

describe("提取注释中的正文", () => {
  test("带换行符的单行注释", () => {
    const comment = "// 这是单行注释\n";
    const content = extraContentFromComments(comment);
    expect(content).toBe("这是单行注释");
  });

  test("标准的单行注释", () => {
    const comment = "// 这是单行注释";
    const content = extraContentFromComments(comment);
    expect(content).toBe("这是单行注释");
  });

  test("标准多行注释", () => {
    const comment = `/**
 	* 这是多行注释
 	*/`;
    const content = extraContentFromComments(comment);
    expect(content).toBe("这是多行注释");
  });
});
