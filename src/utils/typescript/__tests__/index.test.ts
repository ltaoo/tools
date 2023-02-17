import { describe, test, expect } from "vitest";
import {
  buildCommentFromDescription,
  JSONSchema,
  jsonSchema2Interface,
  jsonSchema2JSDoc,
  JSONSchemaTypes,
} from "..";
import { jsEnumPlugin, tsEnumPlugin } from "../plugins/enum";

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

  test("数组中包含不同类型的值", () => {
    const schema = {
      type: "object",
      properties: {
        name: {
          type: "string",
          description: "商品名称",
        },
        count: {
          type: "number",
          description: "商品数量",
        },
        onSale: {
          type: "boolean",
          description: "是否在售",
        },
        sku: {
          type: "array",
          items: {
            type: "unknown",
          },
          description: "sku",
        },
        id: {
          type: "number",
          description: "sku id",
        },
        properties: {
          type: "array",
          items: [
            {
              type: "string",
              description: "珠子尺寸",
            },
            {
              type: "number",
              description: "珠子数量",
            },
          ],
          description: "规格",
        },
        price: {
          type: "number",
          description: "价格（单位分）",
        },
      },
    };
    const interfaceStr = jsonSchema2Interface(schema as JSONSchema);
    expect(interfaceStr).toBe(`interface ResponseRoot {
  /** 商品名称 */
  name: string;
  /** 商品数量 */
  count: number;
  /** 是否在售 */
  onSale: boolean;
  /** sku */
  sku: unknown[];
  /** sku id */
  id: number;
  /** 规格 */
  properties: [
    /** 珠子尺寸 */
    string,
    /** 珠子数量 */
    number
  ];
  /** 价格（单位分） */
  price: number;
}`);
  });

  test("存在枚举", () => {
    const schema = {
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
          type: JSONSchemaTypes.Number,
          description:
            "状态。1：在售(OnSale)；2：缺货(Missing)；3：售罄(SoldOut)；",
        },
        detail: {
          type: JSONSchemaTypes.Object,
          properties: {
            inner: {
              type: JSONSchemaTypes.Number,
              description:
                "测试。1：测试1(test1)；2：测试2(test2)；3：测试3(test3)；",
            },
          },
        },
      },
    } as JSONSchema;
    const result = jsonSchema2Interface(
      schema,
      ["ResponseRoot"],
      tsEnumPlugin(/([0-9a-z]{1,})：([^\(]{1,})\({0,1}([^\)]{1,})\){0,1}；/)
    );
    expect(result).toStrictEqual(`enum ResponseRootStatus {
  /** 在售 */
  OnSale = 1,
  /** 缺货 */
  Missing = 2,
  /** 售罄 */
  SoldOut = 3,
};
enum ResponseRootDetailInner {
  /** 测试1 */
  test1 = 1,
  /** 测试2 */
  test2 = 2,
  /** 测试3 */
  test3 = 3,
};
interface ResponseRoot {
  /** 商品名称 */
  name: string;
  /** 商品数量 */
  count: number;
  /** 状态。1：在售(OnSale)；2：缺货(Missing)；3：售罄(SoldOut)； */
  status: ResponseRootStatus;
  detail: {
    /** 测试。1：测试1(test1)；2：测试2(test2)；3：测试3(test3)； */
    inner: ResponseRootDetailInner;
  };
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
 * @prop {object} data 字段名最好是驼峰格式，不要返回没有用的字段。data只能是object类型
 * @prop {number} data.orderNo 单号
 * @prop {boolean} success
 * @prop {string[]} itemImgs 图片列表
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
 * @prop {object} data 字段名最好是驼峰格式，不要返回没有用的字段。data只能是object类型
 * @prop {number} data.orderNo 单号
 * @prop {object} data.person 参与者
 * @prop {string} data.person.name 姓名
 * @prop {object} data.person.habits 爱好
 * @prop {boolean} data.person.habits.sleep 睡觉
 * @prop {boolean} success
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
 * @prop {string[]} books 正在阅读
 *
 * @typedef {object} ResponseRoot
 * @prop {object} data 字段名最好是驼峰格式，不要返回没有用的字段。data只能是object类型
 * @prop {number} data.orderNo 单号
 * @prop {boolean} success
 * @prop {[string, number, boolean, FourthAnything, string[]]} anything 包含各种类型数据
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
 * @prop {string[]} books 正在阅读
 *
 * @typedef {object} ResponseRoot
 * @prop {FirstAnything[]} anything 元素均为对象
 */`);
  });

  test("存在枚举", () => {
    const schema = {
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
          type: JSONSchemaTypes.Number,
          description:
            "状态。1：在售(OnSale)；2：缺货(Missing)；3：售罄(SoldOut)；",
        },
        detail: {
          type: JSONSchemaTypes.Object,
          properties: {
            inner: {
              type: JSONSchemaTypes.Number,
              description:
                "测试。1：测试1(test1)；2：测试2(test2)；3：测试3(test3)；",
            },
          },
        },
      },
    } as JSONSchema;
    const result = jsonSchema2JSDoc(
      schema,
      ["ResponseRoot"],
      jsEnumPlugin(/([0-9a-z]{1,})：([^\(]{1,})\({0,1}([^\)]{1,})\){0,1}；/)
    );
    expect(result).toStrictEqual(`/** @enum {number} */
const ResponseRootStatus = {
  /** 在售 */
  OnSale: 1,
  /** 缺货 */
  Missing: 2,
  /** 售罄 */
  SoldOut: 3,
};
/** @enum {number} */
const ResponseRootDetailInner = {
  /** 测试1 */
  test1: 1,
  /** 测试2 */
  test2: 2,
  /** 测试3 */
  test3: 3,
};
/**
 * @typedef {object} ResponseRoot
 * @prop {string} name 商品名称
 * @prop {number} count 商品数量
 * @prop {ResponseRootStatus} status 状态。1：在售(OnSale)；2：缺货(Missing)；3：售罄(SoldOut)；
 * @prop {object} detail
 * @prop {ResponseRootDetailInner} detail.inner 测试。1：测试1(test1)；2：测试2(test2)；3：测试3(test3)；
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
