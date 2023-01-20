import { describe, test, expect } from "vitest";
import {
  buildCommentFromDescription,
  JSONSchema,
  jsonSchema2Interface,
  jsonSchema2JSDoc,
} from "..";

describe("生成 typescript interface", () => {
  test("包含注释", () => {
    const schema = {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            orderNo: {
              type: "number",
              description: "单号",
            },
          },
          description:
            "字段名最好是驼峰格式，不要返回没有用的字段\ndata只能是object类型",
        },
        success: {
          type: "boolean",
        },
        itemImgs: {
          type: "array",
          items: {
            type: "string",
          },
          description: "图片列表",
        },
      },
    };
    const interfaceStr = jsonSchema2Interface(schema as JSONSchema);
    expect(interfaceStr).toBe(`interface ResponseRoot {
  /**
   * 字段名最好是驼峰格式，不要返回没有用的字段
   * data只能是object类型
   */
  data: {
    /** 单号 */
    orderNo: number;
  };
  success: boolean;
  /** 图片列表 */
  itemImgs: string[];
}`);
  });

  test("存在深层数据", () => {
    const schema = {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            orderNo: {
              type: "number",
              description: "单号",
            },
            person: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "姓名",
                },
                habits: {
                  type: "object",
                  properties: {
                    sleep: {
                      type: "boolean",
                      description: "睡觉",
                    },
                  },
                  description: "爱好",
                },
              },
              description: "参与者",
            },
          },
          description:
            "字段名最好是驼峰格式，不要返回没有用的字段\ndata只能是object类型",
        },
        success: {
          type: "boolean",
        },
      },
    };
    const interfaceStr = jsonSchema2Interface(schema as JSONSchema);
    expect(interfaceStr).toBe(`interface ResponseRoot {
  /**
   * 字段名最好是驼峰格式，不要返回没有用的字段
   * data只能是object类型
   */
  data: {
    /** 单号 */
    orderNo: number;
    /** 参与者 */
    person: {
      /** 姓名 */
      name: string;
      /** 爱好 */
      habits: {
        /** 睡觉 */
        sleep: boolean;
      };
    };
  };
  success: boolean;
}`);
  });

  test("数组中包含不同类型的值", () => {
    const schema = {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            orderNo: {
              type: "number",
              description: "单号",
            },
          },
          description:
            "字段名最好是驼峰格式，不要返回没有用的字段\ndata只能是object类型",
        },
        success: {
          type: "boolean",
        },
        anything: {
          type: "array",
          items: [
            {
              type: "string",
              description: "名称",
            },
            {
              type: "number",
              description: "年龄",
            },
            {
              type: "boolean",
              description: "开心",
            },
            {
              type: "object",
              properties: {
                books: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "正在阅读",
                },
              },
              description: "更多1",
            },
            {
              type: "array",
              items: {
                type: "string",
              },
              description: "想阅读",
            },
          ],
          description: "包含各种类型数据",
        },
      },
    };
    const interfaceStr = jsonSchema2Interface(schema as JSONSchema);
    expect(interfaceStr).toBe(`interface ResponseRoot {
  /**
   * 字段名最好是驼峰格式，不要返回没有用的字段
   * data只能是object类型
   */
  data: {
    /** 单号 */
    orderNo: number;
  };
  success: boolean;
  /** 包含各种类型数据 */
  anything: [
    /** 名称 */
    string,
    /** 年龄 */
    number,
    /** 开心 */
    boolean,
    /** 更多1 */
    {
      /** 正在阅读 */
      books: string[];
    },
    /** 想阅读 */
    string[]
  ];
}`);
  });

  test("数组中是相同的对象", () => {
    const schema = {
      type: "object",
      properties: {
        anything: {
          type: "array",
          items: {
            type: "object",
            properties: {
              books: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "正在阅读",
              },
            },
            description: "更多1",
          },
          description: "元素均为对象",
        },
      },
    };
    const interfaceStr = jsonSchema2Interface(schema as JSONSchema);
    expect(interfaceStr).toBe(`interface ResponseRoot {
  /** 元素均为对象 */
  anything: {
    /** 正在阅读 */
    books: string[];
  }[];
}`);
  });
});

describe("生成 JSDoc", () => {
  test("包含注释", () => {
    const schema = {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            orderNo: {
              type: "number",
              description: "单号",
            },
          },
          description:
            "字段名最好是驼峰格式，不要返回没有用的字段\ndata只能是object类型",
        },
        success: {
          type: "boolean",
        },
        itemImgs: {
          type: "array",
          items: {
            type: "string",
          },
          description: "图片列表",
        },
      },
    };
    const interfaceStr = jsonSchema2JSDoc(schema as JSONSchema);
    expect(interfaceStr).toBe(`/**
 * @typedef {object} ResponseRoot
 * @prop {object} ResponseRoot.data 字段名最好是驼峰格式，不要返回没有用的字段。data只能是object类型
 * @prop {number} ResponseRoot.data.orderNo 单号
 * @prop {boolean} ResponseRoot.success
 * @prop {string[]} ResponseRoot.itemImgs 图片列表
 */`);
  });

  test("存在深层数据", () => {
    const schema = {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            orderNo: {
              type: "number",
              description: "单号",
            },
            person: {
              type: "object",
              properties: {
                name: {
                  type: "string",
                  description: "姓名",
                },
                habits: {
                  type: "object",
                  properties: {
                    sleep: {
                      type: "boolean",
                      description: "睡觉",
                    },
                  },
                  description: "爱好",
                },
              },
              description: "参与者",
            },
          },
          description:
            "字段名最好是驼峰格式，不要返回没有用的字段\ndata只能是object类型",
        },
        success: {
          type: "boolean",
        },
      },
    };
    const interfaceStr = jsonSchema2JSDoc(schema as JSONSchema);
    expect(interfaceStr).toBe(`/**
 * @typedef {object} ResponseRoot
 * @prop {object} ResponseRoot.data 字段名最好是驼峰格式，不要返回没有用的字段。data只能是object类型
 * @prop {number} ResponseRoot.data.orderNo 单号
 * @prop {object} ResponseRoot.data.person 参与者
 * @prop {string} ResponseRoot.data.person.name 姓名
 * @prop {object} ResponseRoot.data.person.habits 爱好
 * @prop {boolean} ResponseRoot.data.person.habits.sleep 睡觉
 * @prop {boolean} ResponseRoot.success
 */`);
  });

  test("数组中包含不同类型的值", () => {
    const schema = {
      type: "object",
      properties: {
        data: {
          type: "object",
          properties: {
            orderNo: {
              type: "number",
              description: "单号",
            },
          },
          description:
            "字段名最好是驼峰格式，不要返回没有用的字段\ndata只能是object类型",
        },
        success: {
          type: "boolean",
        },
        anything: {
          type: "array",
          items: [
            {
              type: "string",
              description: "名称",
            },
            {
              type: "number",
              description: "年龄",
            },
            {
              type: "boolean",
              description: "开心",
            },
            {
              type: "object",
              properties: {
                books: {
                  type: "array",
                  items: {
                    type: "string",
                  },
                  description: "正在阅读",
                },
              },
              description: "更多1",
            },
            {
              type: "array",
              items: {
                type: "string",
              },
              description: "想阅读",
            },
          ],
          description: "包含各种类型数据",
        },
      },
    };
    const interfaceStr = jsonSchema2JSDoc(schema as JSONSchema);
    expect(interfaceStr).toBe(`/**
 * @typedef {object} FourthAnything 更多1
 * @prop {string[]} FourthAnything.books 正在阅读
 *
 * @typedef {object} ResponseRoot
 * @prop {object} ResponseRoot.data 字段名最好是驼峰格式，不要返回没有用的字段。data只能是object类型
 * @prop {number} ResponseRoot.data.orderNo 单号
 * @prop {boolean} ResponseRoot.success
 * @prop {[string, number, boolean, FourthAnything, string[]]} ResponseRoot.anything 包含各种类型数据
 */`);
  });

  test("数组中是相同的对象", () => {
    const schema = {
      type: "object",
      properties: {
        anything: {
          type: "array",
          items: {
            type: "object",
            properties: {
              books: {
                type: "array",
                items: {
                  type: "string",
                },
                description: "正在阅读",
              },
            },
            description: "更多1",
          },
          description: "元素均为对象",
        },
      },
    };
    const interfaceStr = jsonSchema2JSDoc(schema as JSONSchema);
    expect(interfaceStr).toBe(`/**
 * @typedef {object} FirstAnything 更多1
 * @prop {string[]} FirstAnything.books 正在阅读
 *
 * @typedef {object} ResponseRoot
 * @prop {FirstAnything[]} ResponseRoot.anything 元素均为对象
 */`);
  });
});

describe("从 schema 的 description 构建 interface 的注释", () => {
  test("不包含换行符，都生成一行的多行注释", () => {
    const description = "这是名称";
    const comment = buildCommentFromDescription(description);
    expect(comment).toStrictEqual(["/** 这是名称 */"]);
  });

  test("包含换行符，都生成多行的多行注释", () => {
    const description = "这是名称\n注意";
    const comment = buildCommentFromDescription(description);
    expect(comment).toStrictEqual(["/**", " * 这是名称", " * 注意", " */"]);
  });
});
