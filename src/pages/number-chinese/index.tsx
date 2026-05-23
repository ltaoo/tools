/**
 * @file 数值转换 - 数字转中文读法
 */
import { useState, useMemo } from "react";
import copy from "copy-to-clipboard";
import message from "antd/es/message";
import "antd/es/message/style/index";

const DIGITS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const UNIT_WITHIN = ["", "十", "百", "千"];
const UNIT_SECTION = ["", "万", "亿", "兆", "京", "垓"];

/**
 * 根据数值量级返回整体颜色
 *
 *   < 1万          → 黑色
 *   1万 ~ 10万      → 蓝色
 *   10万 ~ 100万    → 绿色
 *   100万 ~ 1000万  → 红色
 *   1000万 ~ 1亿    → 紫色
 *   1亿及以上       → 粉色
 */
function getMagnitudeColor(num: bigint): string {
  if (num >= 100000000n) return "text-pink-600"; // 亿+    粉色
  if (num >= 10000000n) return "text-purple-600"; // 千万   紫色
  if (num >= 1000000n) return "text-red-600"; // 百万   红色
  if (num >= 100000n) return "text-emerald-600"; // 十万   绿色
  if (num >= 10000n) return "text-blue-600"; // 万     蓝色
  return "text-black"; // <万    黑色
}

/**
 * 将整数部分转为中文读法
 */
function integerToChinese(num: bigint): string {
  if (num === 0n) return DIGITS[0];

  const sections: number[] = [];
  let n = num;
  while (n > 0n) {
    sections.push(Number(n % 10000n));
    n = n / 10000n;
  }

  const parts: string[] = [];
  let needZero = false;

  for (let i = sections.length - 1; i >= 0; i--) {
    const value = sections[i];

    if (value === 0) {
      if (parts.length > 0) {
        needZero = true;
      }
      continue;
    }

    if (needZero) {
      parts.push(DIGITS[0]);
      needZero = false;
    } else if (parts.length > 0 && value < 1000) {
      parts.push(DIGITS[0]);
    }

    parts.push(sectionToChinese(value));

    const unit = UNIT_SECTION[i];
    if (unit) {
      parts.push(unit);
    }
  }

  return parts.join("");
}

/**
 * 将 0-9999 的数转为中文读法
 */
function sectionToChinese(section: number): string {
  if (section === 0) return "";

  const str = String(section);
  const len = str.length;
  const digits = str.split("").map(Number);

  const parts: string[] = [];
  let hasZero = false;
  let started = false;

  for (let i = 0; i < len; i++) {
    const d = digits[i];
    const pos = len - 1 - i;

    if (d !== 0) {
      if (hasZero) {
        parts.push(DIGITS[0]);
        hasZero = false;
      }
      if (pos === 1 && d === 1 && !started) {
        parts.push(UNIT_WITHIN[pos]);
      } else {
        parts.push(DIGITS[d]);
        if (UNIT_WITHIN[pos]) {
          parts.push(UNIT_WITHIN[pos]);
        }
      }
      started = true;
    } else {
      if (started) {
        hasZero = true;
      }
    }
  }

  return parts.join("");
}

/**
 * 将数字字符串转为中文读法，返回整体文本及颜色
 */
type NumberResult = { text: string; color: string } | null;

function numberToChinese(input: string): NumberResult {
  const cleaned = input.replace(/[,\s]/g, "").trim();
  if (!cleaned) return null;

  let negative = false;
  let numStr = cleaned;
  if (cleaned.startsWith("-")) {
    negative = true;
    numStr = cleaned.slice(1);
  }

  if (!/^\d+(\.\d+)?$/.test(numStr)) {
    return { text: "无效数字", color: "text-red-500" };
  }

  const [intPart, decPart] = numStr.split(".");

  let intNum: bigint;
  try {
    intNum = BigInt(intPart);
  } catch {
    return { text: "数字过大或格式无效", color: "text-red-500" };
  }

  const color = getMagnitudeColor(intNum);

  let result = "";
  if (negative) {
    result += "负";
  }
  result += integerToChinese(intNum);

  if (decPart) {
    result += "点";
    for (const ch of decPart) {
      result += DIGITS[parseInt(ch, 10)];
    }
  }

  return { text: result, color };
}

const NumberChinesePage = () => {
  const [input, setInput] = useState("");

  const result = useMemo(() => numberToChinese(input), [input]);

  const handleCopy = () => {
    if (
      result &&
      result.text !== "无效数字" &&
      result.text !== "数字过大或格式无效"
    ) {
      copy(result.text);
      message.success("复制成功");
    }
  };

  const handleClear = () => {
    setInput("");
  };

  const examples = [
    { label: "349,890,478", value: "三亿四千九百八十九万零四百七十八" },
    { label: "100000000", value: "一亿" },
    { label: "100010001", value: "一亿零一万零一" },
    { label: "123456.78", value: "十二万三千四百五十六点七八" },
    { label: "-2024", value: "负二千零二十四" },
  ];

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">数值转换</h1>
      <p className="text-gray-500">
        将数字（支持千分位、小数、负数）转换为中文读法
      </p>

      <div className="flex">
        {/* 输入区域 */}
        <div className="flex-1 relative">
          <textarea
            className={`w-full h-24 input ${result?.color || ""}`}
            placeholder="请输入数字，如 349,890,478"
            value={input}
            onChange={(event) => {
              setInput(event.target.value);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
              }
            }}
          />
          <div className="flex mt-2 space-x-2">
            <button
              className="py-1 px-4 rounded bg-gray-800 text-white"
              onClick={handleCopy}
            >
              复制结果
            </button>
            <button
              className="py-1 px-4 rounded text-gray-800 bg-white border"
              onClick={handleClear}
            >
              清空
            </button>
          </div>
        </div>

        <div className="w-[1px] mx-4 bg-gray-200"></div>

        {/* 结果区域 */}
        <div className="flex-1 relative">
          <p className="font-medium">转换结果</p>
          <div
            className="matches min-h-24 max-h-78 overflow-y-auto mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded break-all cursor-pointer"
            onClick={handleCopy}
          >
            {result ? (
              <span className={`text-xl leading-relaxed ${result.color}`}>
                {result.text}
              </span>
            ) : (
              <span className="text-gray-400">等待输入...</span>
            )}
          </div>
        </div>
      </div>

      {/* 示例 */}
      <div className="mt-8">
        <h2 className="text-lg font-medium mb-3">示例</h2>
        <div className="space-y-2">
          {examples.map((ex, idx) => (
            <div
              key={idx}
              className="flex items-center space-x-4 py-2 px-4 bg-gray-50 rounded cursor-pointer hover:bg-gray-100"
              onClick={() => setInput(ex.label)}
            >
              <code className="text-sm font-mono bg-gray-200 px-2 py-0.5 rounded">
                {ex.label}
              </code>
              <span className="text-gray-500">→</span>
              <span>{ex.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NumberChinesePage;
