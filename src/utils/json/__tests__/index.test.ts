import { describe, test, expect } from "vitest";

import { JSONSchemaTypes } from "@/utils/typescript";

import { parse } from "../ast";
import { extraContentFromComments, toJSONSchema } from "..";
import { enumPluginFactory } from "../plugins/enum";

describe("json 转 json schema", () => {
  test("根节点为对象且只包含简单类型数据，行末注释", () => {
    const json = `{
  	"name": "ltaoo", // 姓名
  	"age": 18 // 年龄
  }`;
    const scheme = toJSONSchema(parse(json));
    expect(scheme).toStrictEqual({
      type: JSONSchemaTypes.Object,
      properties: {
        name: {
          type: JSONSchemaTypes.String,
          description: "姓名",
        },
        age: {
          type: JSONSchemaTypes.Number,
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
      type: JSONSchemaTypes.Object,
      properties: {
        name: {
          type: JSONSchemaTypes.String,
          description: "姓名",
        },
        age: {
          type: JSONSchemaTypes.Number,
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
      type: JSONSchemaTypes.Object,
      properties: {
        name: {
          type: JSONSchemaTypes.String,
          description: "姓名",
        },
        records: {
          type: JSONSchemaTypes.Object,
          properties: {
            win: {
              type: JSONSchemaTypes.String,
              description: "胜利记录",
            },
          },
          description: "记录",
        },
        habits: {
          type: JSONSchemaTypes.Array,
          items: {
            type: JSONSchemaTypes.String,
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
      type: JSONSchemaTypes.Object,
      properties: {
        names: {
          type: JSONSchemaTypes.Array,
          items: {
            type: JSONSchemaTypes.String,
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
      type: JSONSchemaTypes.Object,
      properties: {
        names: {
          type: JSONSchemaTypes.Array,
          items: [
            {
              type: JSONSchemaTypes.String,
            },
            {
              type: JSONSchemaTypes.Number,
            },
            {
              type: JSONSchemaTypes.Boolean,
            },
            {
              type: JSONSchemaTypes.Object,
              properties: {
                hello: {
                  type: JSONSchemaTypes.String,
                },
              },
            },
            {
              type: JSONSchemaTypes.Array,
              items: {
                type: JSONSchemaTypes.String,
              },
            },
          ],
        },
      },
    });
  });

  test("数组内存在多种类型", () => {
    const json = `{
  "name": "精品紫檀好料", // 商品名称
  "count": 100, // 商品数量
  "onSale": true, // 是否在售
  "sku": [ // sku
    {
      "id": 1, // sku id
      "properties": [  // 规格
        "2.0", // 珠子尺寸
        20 // 珠子数量
      ],
      "price": 1899 // 价格（单位分）
    }
  ],
}`;
    const scheme = toJSONSchema(parse(json));
    expect(scheme).toStrictEqual({
      type: JSONSchemaTypes.Object,
      properties: {
        name: {
          type: JSONSchemaTypes.String,
          description: "商品名称",
        },
        count: {
          type: JSONSchemaTypes.Number,
          description: "商品数量",
        },
        onSale: {
          type: JSONSchemaTypes.Boolean,
          description: "是否在售",
        },
        sku: {
          type: JSONSchemaTypes.Array,
          items: {
            type: JSONSchemaTypes.Object,
            properties: {
              id: {
                type: JSONSchemaTypes.Number,
                description: "sku id",
              },
              properties: {
                type: JSONSchemaTypes.Array,
                items: [
                  {
                    type: JSONSchemaTypes.String,
                    description: "珠子尺寸",
                  },
                  {
                    type: JSONSchemaTypes.Number,
                    description: "珠子数量",
                  },
                ],
                description: "规格",
              },
              price: {
                type: JSONSchemaTypes.Number,
                description: "价格（单位分）",
              },
            },
          },
          description: "sku",
        },
      },
    });
  });

  test("存在枚举值", () => {
    const json = `{
  "name": "精品紫檀好料", // 商品名称
  "count": 100, // 商品数量
  "status": 1, // 状态。1：在售；2：缺货；3：售罄；
}`;
    const scheme = toJSONSchema(parse(json), {
      visit: {
        value: enumPluginFactory(/([0-9a-z]{1,})：([^；]{1,})；/).value,
      },
    });
    expect(scheme).toStrictEqual({
      type: JSONSchemaTypes.Object,
      properties: {
        name: {
          type: JSONSchemaTypes.String,
          description: "商品名称",
        },
        count: {
          type: JSONSchemaTypes.Number,
          description: "商品数量",
        },
        status: {
          type: JSONSchemaTypes.Enum,
          enum: [1, 2, 3],
          description: "状态。1：在售；2：缺货；3：售罄；",
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
