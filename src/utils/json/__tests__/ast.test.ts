import { describe, test, expect } from "vitest";
import {
  extraContentFromMultipleComments,
  extraContentFromSingleComments,
} from "..";

import { NodeTypes, parse } from "../ast";

describe("不包含注释", () => {
  test("1、简单数据结构", () => {
    const jsonStr = `{
	"name": "ltaoo",
	"age": 18,
	"live": true,
	"habits": ["eat"],
	"other": {
		"eat": true
	}
}`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "age",
            raw: "age",
          },
          value: {
            type: NodeTypes.Literal,
            value: 18,
            raw: "18",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "live",
            raw: "live",
          },
          value: {
            type: NodeTypes.Literal,
            value: true,
            raw: "true",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "habits",
            raw: "habits",
          },
          value: {
            type: NodeTypes.Array,
            children: [
              {
                type: NodeTypes.Literal,
                value: "eat",
                raw: "eat",
                leadingComments: [],
                trailingComments: [],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "other",
            raw: "other",
          },
          value: {
            type: NodeTypes.Object,
            children: [
              {
                type: NodeTypes.Property,
                key: {
                  type: NodeTypes.Identifier,
                  value: "eat",
                  raw: "eat",
                },
                value: {
                  type: NodeTypes.Literal,
                  value: true,
                  raw: "true",
                  leadingComments: [],
                  trailingComments: [],
                },
                leadingComments: [],
                trailingComments: [],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [],
        },
      ],
    });
  });
  test("2、复杂数据结构", () => {
    const jsonStr = `{
	"name": "ltaoo",
	"age": 18,
	"live": true,
	"habits": ["eat", 2000, ["hello", "world"], { "some": "thing" }],
	"other": {
		"eat": true,
		"age": 2000,
		"things": [],
		"deep": {
			"a": 12,
			"deep2": {
				"deep3": {
					"deep4": {
						"deep5": {}
					}
				}
			}
		}
	}
}`;
    const result = parse(jsonStr);
    const expectedResult = {
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "age",
            raw: "age",
          },
          value: {
            type: NodeTypes.Literal,
            value: 18,
            raw: "18",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "live",
            raw: "live",
          },
          value: {
            type: NodeTypes.Literal,
            value: true,
            raw: "true",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "habits",
            raw: "habits",
          },
          value: {
            type: NodeTypes.Array,
            children: [
              {
                type: NodeTypes.Literal,
                value: "eat",
                raw: "eat",
                leadingComments: [],
                trailingComments: [],
              },
              {
                type: NodeTypes.Literal,
                value: 2000,
                raw: "2000",
                leadingComments: [],
                trailingComments: [],
              },
              {
                type: NodeTypes.Array,
                children: [
                  {
                    type: NodeTypes.Literal,
                    value: "hello",
                    raw: "hello",
                    leadingComments: [],
                    trailingComments: [],
                  },
                  {
                    type: NodeTypes.Literal,
                    value: "world",
                    raw: "world",
                    leadingComments: [],
                    trailingComments: [],
                  },
                ],
              },
              {
                type: NodeTypes.Object,
                children: [
                  {
                    type: NodeTypes.Property,
                    key: {
                      type: NodeTypes.Identifier,
                      value: "some",
                      raw: "some",
                    },
                    value: {
                      type: NodeTypes.Literal,
                      value: "thing",
                      raw: "thing",
                      leadingComments: [],
                      trailingComments: [],
                    },
                    leadingComments: [],
                    trailingComments: [],
                  },
                ],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "other",
            raw: "other",
          },
          value: {
            type: NodeTypes.Object,
            children: [
              {
                type: NodeTypes.Property,
                key: {
                  type: NodeTypes.Identifier,
                  value: "eat",
                  raw: "eat",
                },
                value: {
                  type: NodeTypes.Literal,
                  value: true,
                  raw: "true",
                  leadingComments: [],
                  trailingComments: [],
                },
                leadingComments: [],
                trailingComments: [],
              },
              {
                type: NodeTypes.Property,
                key: {
                  type: NodeTypes.Identifier,
                  value: "age",
                  raw: "age",
                },
                value: {
                  type: NodeTypes.Literal,
                  value: 2000,
                  raw: "2000",
                  leadingComments: [],
                  trailingComments: [],
                },
                leadingComments: [],
                trailingComments: [],
              },
              {
                type: NodeTypes.Property,
                key: {
                  type: NodeTypes.Identifier,
                  value: "things",
                  raw: "things",
                },
                value: {
                  type: NodeTypes.Array,
                  children: [],
                },
                leadingComments: [],
                trailingComments: [],
              },
              {
                type: NodeTypes.Property,
                key: {
                  type: NodeTypes.Identifier,
                  value: "deep",
                  raw: "deep",
                },
                value: {
                  type: NodeTypes.Object,
                  children: [
                    {
                      type: NodeTypes.Property,
                      key: {
                        type: NodeTypes.Identifier,
                        value: "a",
                        raw: "a",
                      },
                      value: {
                        type: NodeTypes.Literal,
                        value: 12,
                        raw: "12",
                        leadingComments: [],
                        trailingComments: [],
                      },
                      leadingComments: [],
                      trailingComments: [],
                    },
                    {
                      type: NodeTypes.Property,
                      key: {
                        type: NodeTypes.Identifier,
                        value: "deep2",
                        raw: "deep2",
                      },
                      value: {
                        type: NodeTypes.Object,
                        children: [
                          {
                            type: NodeTypes.Property,
                            key: {
                              type: NodeTypes.Identifier,
                              value: "deep3",
                              raw: "deep3",
                            },
                            value: {
                              type: NodeTypes.Object,
                              children: [
                                {
                                  type: NodeTypes.Property,
                                  key: {
                                    type: NodeTypes.Identifier,
                                    value: "deep4",
                                    raw: "deep4",
                                  },
                                  value: {
                                    type: NodeTypes.Object,
                                    children: [
                                      {
                                        type: NodeTypes.Property,
                                        key: {
                                          type: NodeTypes.Identifier,
                                          value: "deep5",
                                          raw: "deep5",
                                        },
                                        value: {
                                          type: NodeTypes.Object,
                                          children: [],
                                        },
                                        leadingComments: [],
                                        trailingComments: [],
                                      },
                                    ],
                                  },
                                  leadingComments: [],
                                  trailingComments: [],
                                },
                              ],
                            },
                            // 这个注释掉，测试不通过，但没有提示
                            leadingComments: [],
                            trailingComments: [],
                          },
                        ],
                      },
                      leadingComments: [],
                      trailingComments: [],
                    },
                  ],
                },
                leadingComments: [],
                trailingComments: [],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [],
        },
      ],
    };
    expect(result).toStrictEqual(expectedResult);
  });
});

describe("包含注释", () => {
  test("多行注释", () => {
    const jsonStr = `{
  	/**
  	 * hello
  	 */
  	"name": "ltaoo"
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: `/**
  	 * hello
  	 */`,
            },
          ],
          trailingComments: [],
        },
      ],
    });
  });
  test("多行注释", () => {
    const jsonStr = `{
  	"name": "ltaoo" /** 多行注释 */
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: `/** 多行注释 */`,
            },
          ],
        },
      ],
    });
  });
  test("行末多行注释与行首多行注释", () => {
    const jsonStr = `{
  /**
   * world
   */
  "name": "ltaoo" /** hello */
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: `/**
   * world
   */`,
            },
          ],
          trailingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: `/** hello */`,
            },
          ],
        },
      ],
    });
  });
  test("行末多行注释与行首多行注释", () => {
    const jsonStr = `{
  /**
   * world
   */
  /**
   * world2
   */
  /**
   * world3
   */
  "name": "ltaoo" /** hello */ /** hello2 */
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: `/**
   * world
   */`,
            },
            {
              type: NodeTypes.MultiLineComment,
              text: `/**
   * world2
   */`,
            },
            {
              type: NodeTypes.MultiLineComment,
              text: `/**
   * world3
   */`,
            },
          ],
          trailingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: `/** hello */`,
            },
            {
              type: NodeTypes.MultiLineComment,
              text: `/** hello2 */`,
            },
          ],
        },
      ],
    });
  });
  test("单行注释", () => {
    const jsonStr = `{
  // hello
  "name": "ltaoo"
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// hello",
            },
          ],
          trailingComments: [],
        },
      ],
    });
  });
  test("行末多行注释与行首多行注释", () => {
    const jsonStr = `{
  	"name": "ltaoo", /** world2 */
  	/**
  	 * world3
  	 */
  	"age": 18
    }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: `/** world2 */`,
            },
          ],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "age",
            raw: "age",
          },
          value: {
            type: NodeTypes.Literal,
            value: 18,
            raw: "18",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: `/**
  	 * world3
  	 */`,
            },
          ],
          trailingComments: [],
        },
      ],
    });
  });
  test("单行注释", () => {
    const jsonStr = `{
  "name": "ltaoo" // hello
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// hello",
            },
          ],
        },
      ],
    });
  });
  test("单行注释", () => {
    const jsonStr = `{
  // world
  "name": "ltaoo" // hello
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// world",
            },
          ],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// hello",
            },
          ],
        },
      ],
    });
  });
  test("注释在对象 { 符号后", () => {
    const jsonStr = `{
    "person": { // 行末注释1
      "name": "ltaoo",
    }
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "person",
            raw: "person",
          },
          value: {
            type: NodeTypes.Object,
            children: [
              {
                type: NodeTypes.Property,
                key: {
                  type: NodeTypes.Identifier,
                  value: "name",
                  raw: "name",
                },
                value: {
                  type: NodeTypes.Literal,
                  value: "ltaoo",
                  raw: "ltaoo",
                  leadingComments: [],
                  trailingComments: [],
                },
                leadingComments: [],
                trailingComments: [],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 行末注释1",
            },
          ],
        },
      ],
    });
  });
  test("数组元素注释", () => {
    const jsonStr = `{
  	"persons": [
  		// this is name value
  		"ltaoo",
  		// this is age value
  		18,
  	],
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "persons",
            raw: "persons",
          },
          value: {
            type: NodeTypes.Array,
            children: [
              {
                type: NodeTypes.Literal,
                value: "ltaoo",
                raw: "ltaoo",
                leadingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// this is name value",
                  },
                ],
                trailingComments: [],
              },
              {
                type: NodeTypes.Literal,
                value: 18,
                raw: "18",
                leadingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// this is age value",
                  },
                ],
                trailingComments: [],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [],
        },
      ],
    });
  });
  test("数组元素多种注释共存", () => {
    const jsonStr = `{
  	"persons": [
  		// this is name value
  		"ltaoo", // 行末注释1
  		// this is age value
  		/**
  		 * 多行注释
  		 */
  		18, // 行末注释2
  	],
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "persons",
            raw: "persons",
          },
          value: {
            type: NodeTypes.Array,
            children: [
              {
                type: NodeTypes.Literal,
                value: "ltaoo",
                raw: "ltaoo",
                leadingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// this is name value",
                  },
                ],
                trailingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// 行末注释1",
                  },
                ],
              },
              {
                type: NodeTypes.Literal,
                value: 18,
                raw: "18",
                leadingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// this is age value",
                  },
                  {
                    type: NodeTypes.MultiLineComment,
                    text: `/**
  		 * 多行注释
  		 */`,
                  },
                ],
                trailingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// 行末注释2",
                  },
                ],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [],
        },
      ],
    });
  });
  test("注释在数组符号后面", () => {
    const jsonStr = `{
    	"persons": [ // 行末注释1
    		"ltaoo",
    	],
    }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "persons",
            raw: "persons",
          },
          value: {
            type: NodeTypes.Array,
            children: [
              {
                type: NodeTypes.Literal,
                value: "ltaoo",
                raw: "ltaoo",
                leadingComments: [],
                trailingComments: [],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 行末注释1",
            },
          ],
        },
      ],
    });
  });
  test("注释在连续的对象和数组符号后", () => {
    const jsonStr = `{
      /** 这是多行注释 */
      "data": {
        "persons": [ // 行末注释1
          "ltaoo",
        ],
      },
    }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "data",
            raw: "data",
          },
          value: {
            type: NodeTypes.Object,
            children: [
              {
                type: NodeTypes.Property,
                key: {
                  type: NodeTypes.Identifier,
                  value: "persons",
                  raw: "persons",
                },
                value: {
                  type: NodeTypes.Array,
                  children: [
                    {
                      type: NodeTypes.Literal,
                      value: "ltaoo",
                      raw: "ltaoo",
                      leadingComments: [],
                      trailingComments: [],
                    },
                  ],
                },
                leadingComments: [],
                trailingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// 行末注释1",
                  },
                ],
              },
            ],
          },
          leadingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: "/** 这是多行注释 */",
            },
          ],
          trailingComments: [],
        },
      ],
    });
  });
  test("多个单行注释", () => {
    const jsonStr = `{
      // world
      // something
  "name": "ltaoo" // hello // hahaha
  }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// world",
            },
            {
              type: NodeTypes.SingleLineComment,
              text: "// something",
            },
          ],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// hello // hahaha",
            },
          ],
        },
      ],
    });
  });
  test("多行注释", () => {
    const jsonStr = `{
    	/**
    	 * 这是第一个多行注释
    	 * 真的有多行
    	 */
    	"name": "ltaoo",
    	"age": 18,
    	"live": true,
    	// 注释总是归属下面的字段
    	"habits": ["eat"], /** 出现在行末的多行注释写法 */ // 多行与单行混写
    	"other": {
    		/**
    		 * 对象内的多行注释
    		 */
    		/**
    		 * 对象内同时存在两个多行注释
    		 */
    		// 再加一个单行注释
    		"eat": true
    	},
    	// 同时存在数组前与行末注释，会怎么样
    	"hahah": [
    		// 数组内的注释
    		"name",
    	], // 数组的行末注释
    }`;
    const result = parse(jsonStr);
    expect(result).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "ltaoo",
            raw: "ltaoo",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: `/**
    	 * 这是第一个多行注释
    	 * 真的有多行
    	 */`,
            },
          ],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "age",
            raw: "age",
          },
          value: {
            type: NodeTypes.Literal,
            value: 18,
            raw: "18",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "live",
            raw: "live",
          },
          value: {
            type: NodeTypes.Literal,
            value: true,
            raw: "true",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "habits",
            raw: "habits",
          },
          value: {
            type: NodeTypes.Array,
            children: [
              {
                type: NodeTypes.Literal,
                value: "eat",
                raw: "eat",
                leadingComments: [],
                trailingComments: [],
              },
            ],
          },
          leadingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 注释总是归属下面的字段",
            },
          ],
          trailingComments: [
            {
              type: NodeTypes.MultiLineComment,
              text: "/** 出现在行末的多行注释写法 */",
            },
            {
              type: NodeTypes.SingleLineComment,
              text: "// 多行与单行混写",
            },
          ],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "other",
            raw: "other",
          },
          value: {
            type: NodeTypes.Object,
            children: [
              {
                type: NodeTypes.Property,
                key: {
                  type: NodeTypes.Identifier,
                  value: "eat",
                  raw: "eat",
                },
                value: {
                  type: NodeTypes.Literal,
                  value: true,
                  raw: "true",
                  leadingComments: [],
                  trailingComments: [],
                },
                leadingComments: [
                  {
                    type: NodeTypes.MultiLineComment,
                    text: `/**
    		 * 对象内的多行注释
    		 */`,
                  },
                  {
                    type: NodeTypes.MultiLineComment,
                    text: `/**
    		 * 对象内同时存在两个多行注释
    		 */`,
                  },
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// 再加一个单行注释",
                  },
                ],
                trailingComments: [],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "hahah",
            raw: "hahah",
          },
          value: {
            type: NodeTypes.Array,
            children: [
              {
                type: NodeTypes.Literal,
                value: "name",
                raw: "name",
                leadingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// 数组内的注释",
                  },
                ],
                trailingComments: [],
              },
            ],
          },
          leadingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 同时存在数组前与行末注释，会怎么样",
            },
          ],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 数组的行末注释",
            },
          ],
        },
      ],
    });
  });
  test("数组元素有注释", () => {
    const jsonStr = `{
  "name": "精品紫檀好料", // 商品名称
  "count": 100, // 商品数量
  "onSale": true, // 是否在售
  "sku": [ // sku
  ],
  "id": 1, // sku id
  "properties": [  // 规格
    "2.0", // 珠子尺寸
    20 // 珠子数量
  ],
  "price": 1899 // 价格（单位分）
}`;
    const ast = parse(jsonStr);
    expect(ast).toStrictEqual({
      type: NodeTypes.Object,
      children: [
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "name",
            raw: "name",
          },
          value: {
            type: NodeTypes.Literal,
            value: "精品紫檀好料",
            raw: "精品紫檀好料",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 商品名称",
            },
          ],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "count",
            raw: "count",
          },
          value: {
            type: NodeTypes.Literal,
            value: 100,
            raw: "100",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 商品数量",
            },
          ],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "onSale",
            raw: "onSale",
          },
          value: {
            type: NodeTypes.Literal,
            value: true,
            raw: "true",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 是否在售",
            },
          ],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "sku",
            raw: "sku",
          },
          value: {
            type: NodeTypes.Array,
            children: [],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// sku",
            },
          ],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "id",
            raw: "id",
          },
          value: {
            type: NodeTypes.Literal,
            value: 1,
            raw: "1",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// sku id",
            },
          ],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "properties",
            raw: "properties",
          },
          value: {
            type: NodeTypes.Array,
            children: [
              {
                type: NodeTypes.Literal,
                value: "2.0",
                raw: "2.0",
                leadingComments: [],
                trailingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// 珠子尺寸",
                  },
                ],
              },
              {
                type: NodeTypes.Literal,
                value: 20,
                raw: "20",
                leadingComments: [],
                trailingComments: [
                  {
                    type: NodeTypes.SingleLineComment,
                    text: "// 珠子数量",
                  },
                ],
              },
            ],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 规格",
            },
          ],
        },
        {
          type: NodeTypes.Property,
          key: {
            type: NodeTypes.Identifier,
            value: "price",
            raw: "price",
          },
          value: {
            type: NodeTypes.Literal,
            value: 1899,
            raw: "1899",
            leadingComments: [],
            trailingComments: [],
          },
          leadingComments: [],
          trailingComments: [
            {
              type: NodeTypes.SingleLineComment,
              text: "// 价格（单位分）",
            },
          ],
        },
      ],
    });
  });
});

describe("提取多行注释正文", () => {
  test("标准多行注释", () => {
    const comment = `/**
   * 这是正文1
   * 这是正文2
   */`;
    const lines = extraContentFromMultipleComments(comment);
    expect(lines).toStrictEqual(["这是正文1", "这是正文2"]);
  });

  test("多了 * 号的多行注释", () => {
    const comment = `/***
  **
   ** 这是正文1
  * 这是正文2
   *这是正文3
   这是正文4
   ***/`;
    const lines = extraContentFromMultipleComments(comment);
    expect(lines).toStrictEqual([
      "这是正文1",
      "这是正文2",
      "这是正文3",
      "这是正文4",
    ]);
  });

  test("最简单的多行注释写法", () => {
    const comment = `/*
   这是正文1
   这是正文2
      这是正文3
   这是正文4
  */`;
    const lines = extraContentFromMultipleComments(comment);
    expect(lines).toStrictEqual([
      "这是正文1",
      "这是正文2",
      "这是正文3",
      "这是正文4",
    ]);
  });

  test("存在空白行的多行注释", () => {
    const comment = `/*
   这是正文1

   这是正文2

   这是正文3

   这是正文4
  */`;
    const lines = extraContentFromMultipleComments(comment);
    expect(lines).toStrictEqual([
      "这是正文1",
      "这是正文2",
      "这是正文3",
      "这是正文4",
    ]);
  });

  test("存在跨行的多行注释", () => {
    const comment = `/* 这是正文1
  这是
  正文4 */`;
    const lines = extraContentFromMultipleComments(comment);
    expect(lines).toStrictEqual(["这是正文1", "这是", "正文4"]);
  });

  test("在一行的多行注释", () => {
    const comment = `/** 这是正文1 */`;
    const lines = extraContentFromMultipleComments(comment);
    expect(lines).toStrictEqual(["这是正文1"]);
  });

  test("在一行的多行注释2", () => {
    const comment = `/* 这是正文1 */`;
    const lines = extraContentFromMultipleComments(comment);
    expect(lines).toStrictEqual(["这是正文1"]);
  });

  test("空白多行注释", () => {
    const comment = `/**
*/`;
    const lines = extraContentFromMultipleComments(comment);
    expect(lines).toStrictEqual([]);
  });
});

describe("提取单行注释正文", () => {
  test("标准多行注释", () => {
    const comment = "// 这是正文1";
    const lines = extraContentFromSingleComments(comment);
    expect(lines).toStrictEqual("这是正文1");
  });

  test("存在一些误导的注释符号", () => {
    const comment = "// 这/是正文 /1 // 感觉是单行注释中的第二个单行注释";
    const lines = extraContentFromSingleComments(comment);
    expect(lines).toStrictEqual(
      "这/是正文 /1 // 感觉是单行注释中的第二个单行注释"
    );
  });

  test("空白单行注释", () => {
    const comment = "// ";
    const lines = extraContentFromSingleComments(comment);
    expect(lines).toStrictEqual("");
  });
});
