export const questions = [
  {
    input: "a1aabaa+a",
    expect: ["a1a", "aba", "a+a"],
  },
  {
    input: "<tr>hello</tr>\n\n<tr>something</tr>",
    expect: ["<tr>hello</tr>", "<tr>something</tr>"],
  },
  {
    input: "ab1c+aa1c+a",
    expect: ["a1c+a"],
  },
  {
    intro: "中间不能存在指定字符",
    input: "ab1c+aa1c+aa1bc+aa1cb+aa1c+ba",
    expect: ["a1c+a"],
    reference: "(?<=a)a[^b]{1,}?a",
  },
  {
    intro: "中间不能存在指定模式",
    input: "abb1c+aab1c+aa1bbc+aa1cbb+aa1c+bba",
    expect: ["ab1c+a"],
    reference: "(?<=a)a[^b]{1,}?a",
  },
  {
    intro: "中间必须存在指定字符",
    input: "ab1c+aa1c+a",
    expect: ["ab1c+a"],
  },
  {
    intro: "中间必须存在指定模式",
    input: "abb1c+aab1c+aa1bbc+aa1cbb+aa1c+bba",
    expect: ["abb1c+a", "a1bbc+a", "a1cbb+a", "a1c+bba"],
    reference: "a[^a]{0,}?bb[^a]{0,}?a",
  },
  {
    intro: "前面不能存在指定字符",
    input: "ab1b+b",
    expect: ["1b", "+b"],
  },
];
