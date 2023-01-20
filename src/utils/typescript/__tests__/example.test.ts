import { describe, test, expect } from "vitest";
import { JSONSchema, JSONSchemaTypes } from "..";
import { buildExampleCode } from "../example";

describe("生成 js 查看示例代码", () => {
  test("简单但包含所有数据结构", () => {
    const schema = {
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
        working: {
          type: JSONSchemaTypes.Boolean,
          description: "在职",
        },
        skills: {
          type: JSONSchemaTypes.Array,
          items: {
            type: JSONSchemaTypes.String,
          },
          description: "技能",
        },
        detail: {
          type: JSONSchemaTypes.Object,
          properties: {
            city: {
              type: JSONSchemaTypes.String,
              description: "城市",
            },
          },
          description: "详细",
        },
      },
      description: "示例数据",
    } as JSONSchema;

    const result = buildExampleCode(schema, {
      language: "js",
      rootKey: "ResponseRoot",
    });

    expect(result).toBe(`/**
 * @typedef {object} ResponseRoot 示例数据
 * @prop {string} ResponseRoot.name 姓名
 * @prop {number} ResponseRoot.age 年龄
 * @prop {boolean} ResponseRoot.working 在职
 * @prop {string[]} ResponseRoot.skills 技能
 * @prop {object} ResponseRoot.detail 详细
 * @prop {string} ResponseRoot.detail.city 城市
 */

/**
 * @param {ResponseRoot} resp
 */
function print(resp) {
  const { name, age, working, skills, detail } = resp;
  skills.map((skillsItem) => {
  });
  const { city } = detail;
}`);
  });

  test("数组包含各种数据结构", () => {
    const schema = {
      type: JSONSchemaTypes.Object,
      properties: {
        skills: {
          type: JSONSchemaTypes.Array,
          items: [
            {
              type: JSONSchemaTypes.String,
              description: "第一个学会的技能",
            },
            {
              type: JSONSchemaTypes.Object,
              properties: {
                start: {
                  type: JSONSchemaTypes.Number,
                  description: "熟练度",
                },
                name: {
                  type: JSONSchemaTypes.String,
                  description: "名称",
                },
                tags: {
                  type: JSONSchemaTypes.Array,
                  items: {
                    type: JSONSchemaTypes.String,
                  },
                  description: "标签",
                },
              },
            },
          ],
          description: "技能",
        },
      },
      description: "示例数据",
    } as JSONSchema;

    const result = buildExampleCode(schema, {
      language: "js",
      rootKey: "ResponseRoot",
    });

    expect(result).toBe(`/**
 * @typedef {object} SecondSkills
 * @prop {number} SecondSkills.start 熟练度
 * @prop {string} SecondSkills.name 名称
 * @prop {string[]} SecondSkills.tags 标签
 *
 * @typedef {object} ResponseRoot 示例数据
 * @prop {[string, SecondSkills]} ResponseRoot.skills 技能
 */

/**
 * @param {ResponseRoot} resp
 */
function print(resp) {
  const { skills } = resp;
  const [first, second] = skills;
  const { start, name, tags } = second;
  tags.map((tagsItem) => {
  });
}`);
  });

  test("数组只包含一种对象", () => {
    const schema = {
      type: JSONSchemaTypes.Object,
      properties: {
        skills: {
          type: JSONSchemaTypes.Array,
          items: {
            type: JSONSchemaTypes.Object,
            properties: {
              start: {
                type: JSONSchemaTypes.Number,
                description: "熟练度",
              },
              name: {
                type: JSONSchemaTypes.String,
                description: "名称",
              },
              tags: {
                type: JSONSchemaTypes.Array,
                items: {
                  type: JSONSchemaTypes.String,
                },
                description: "标签",
              },
            },
          },
          description: "技能",
        },
      },
      description: "示例数据",
    } as JSONSchema;

    const result = buildExampleCode(schema, {
      language: "js",
      rootKey: "ResponseRoot",
    });

    expect(result).toBe(`/**
 * @typedef {object} FirstSkills
 * @prop {number} FirstSkills.start 熟练度
 * @prop {string} FirstSkills.name 名称
 * @prop {string[]} FirstSkills.tags 标签
 *
 * @typedef {object} ResponseRoot 示例数据
 * @prop {FirstSkills[]} ResponseRoot.skills 技能
 */

/**
 * @param {ResponseRoot} resp
 */
function print(resp) {
  const { skills } = resp;
  skills.map((skillsItem) => {
    const { start, name, tags } = skillsItem;
    tags.map((tagsItem) => {
    });
  });
}`);
  });
});

describe("生成 ts 查看示例代码", () => {
  test("简单但包含所有数据结构", () => {
    const schema = {
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
        working: {
          type: JSONSchemaTypes.Boolean,
          description: "在职",
        },
        skills: {
          type: JSONSchemaTypes.Array,
          items: {
            type: JSONSchemaTypes.String,
          },
          description: "技能",
        },
        detail: {
          type: JSONSchemaTypes.Object,
          properties: {
            city: {
              type: JSONSchemaTypes.String,
              description: "城市",
            },
          },
          description: "详细",
        },
      },
      description: "示例数据",
    } as JSONSchema;

    const result = buildExampleCode(schema, {
      language: "ts",
      rootKey: "ResponseRoot",
    });

    expect(result).toBe(`interface ResponseRoot {
  /** 姓名 */
  name: string;
  /** 年龄 */
  age: number;
  /** 在职 */
  working: boolean;
  /** 技能 */
  skills: string[];
  /** 详细 */
  detail: {
    /** 城市 */
    city: string;
  };
}

/**
 * @param resp
 */
function print(resp: ResponseRoot) {
  const { name, age, working, skills, detail } = resp;
  skills.map((skillsItem) => {
  });
  const { city } = detail;
}`);
  });

  test("数组包含各种数据结构", () => {
    const schema = {
      type: JSONSchemaTypes.Object,
      properties: {
        skills: {
          type: JSONSchemaTypes.Array,
          items: [
            {
              type: JSONSchemaTypes.String,
              description: "第一个学会的技能",
            },
            {
              type: JSONSchemaTypes.Object,
              properties: {
                start: {
                  type: JSONSchemaTypes.Number,
                  description: "熟练度",
                },
                name: {
                  type: JSONSchemaTypes.String,
                  description: "名称",
                },
                tags: {
                  type: JSONSchemaTypes.Array,
                  items: {
                    type: JSONSchemaTypes.String,
                  },
                  description: "标签",
                },
              },
            },
          ],
          description: "技能",
        },
      },
      description: "示例数据",
    } as JSONSchema;

    const result = buildExampleCode(schema, {
      language: "ts",
      rootKey: "ResponseRoot",
    });

    expect(result).toBe(`interface ResponseRoot {
  /** 技能 */
  skills: [
    /** 第一个学会的技能 */
    string,
    {
      /** 熟练度 */
      start: number;
      /** 名称 */
      name: string;
      /** 标签 */
      tags: string[];
    }
  ];
}

/**
 * @param resp
 */
function print(resp: ResponseRoot) {
  const { skills } = resp;
  const [first, second] = skills;
  const { start, name, tags } = second;
  tags.map((tagsItem) => {
  });
}`);
  });

  test("数组只包含一种对象", () => {
    const schema = {
      type: JSONSchemaTypes.Object,
      properties: {
        skills: {
          type: JSONSchemaTypes.Array,
          items: {
            type: JSONSchemaTypes.Object,
            properties: {
              start: {
                type: JSONSchemaTypes.Number,
                description: "熟练度",
              },
              name: {
                type: JSONSchemaTypes.String,
                description: "名称",
              },
              tags: {
                type: JSONSchemaTypes.Array,
                items: {
                  type: JSONSchemaTypes.String,
                },
                description: "标签",
              },
            },
          },
          description: "技能",
        },
      },
      description: "示例数据",
    } as JSONSchema;

    const result = buildExampleCode(schema, {
      language: "ts",
      rootKey: "ResponseRoot",
    });

    expect(result).toBe(`interface ResponseRoot {
  /** 技能 */
  skills: {
    /** 熟练度 */
    start: number;
    /** 名称 */
    name: string;
    /** 标签 */
    tags: string[];
  }[];
}

/**
 * @param resp
 */
function print(resp: ResponseRoot) {
  const { skills } = resp;
  skills.map((skillsItem) => {
    const { start, name, tags } = skillsItem;
    tags.map((tagsItem) => {
    });
  });
}`);
  });
});
