/**
 * @file Base64 转换
 */
import { useCallback, useState } from "react";
import copy from "copy-to-clipboard";
// @ts-ignore
import base64 from "base-64";
// @ts-ignore
import utf8 from "utf8";
import message from "antd/es/message";
import "antd/es/message/style/index";

import { convertToDataURL } from "./util";

const Base64ParsePage = () => {
  const [value1, setValue1] = useState("");
  const [value2, setValue2] = useState("");
  const [result1, setResult1] = useState({ type: "text", value: "" });
  const [result2, setResult2] = useState({ type: "text", value: "" });
  const [result3, setResult3] = useState({ type: "text", value: "" });

  const decode = () => {
    if (value1.startsWith("data:image")) {
      setResult1({
        type: "img",
        value: value1,
      });
      return;
    }
    const bytes = base64.decode(value1);
    const text = utf8.decode(bytes);
    setResult1({
      type: "text",
      value: text,
    });
  };
  const encode = () => {
    const bytes = utf8.encode(value2);
    const encoded = base64.encode(bytes);
    setResult2({
      type: "text",
      value: encoded,
    });
    generateDataURL(value2);
  };
  async function generateDataURL(source: unknown) {
    const r = await convertToDataURL(source, "image/png", 1);
    setResult3((prev) => {
      return {
        ...prev,
        value: r,
      };
    });
  }

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Base64 编解码</h1>
      <div className="flex">
        <div className="flex-1 relative">
          <textarea
            className="w-full h-24 input"
            placeholder="请输入解码内容 如 SGVsbG8="
            value={value1}
            onChange={(event) => {
              const content = event.target.value;
              setValue1(content);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                decode();
                return;
              }
            }}
          />
          <div className="flex">
            <button
              className="py-1 px-4 rounded bg-gray-800 text-white"
              onClick={decode}
            >
              解码
            </button>
            <button
              className="py-1 px-4 rounded text-gray-800 bg-white"
              onClick={() => {
                setValue1("");
                setResult1({
                  type: "text",
                  value: "",
                });
              }}
            >
              清空
            </button>
          </div>
          <div className="flex-1 mt-8">
            <p>解码结果</p>
            <div className="matches min-h-24 max-h-78 overflow-y-auto mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded">
              {result1.type === "text" ? (
                <div
                  onClick={() => {
                    if (result1.type === "text") {
                      copy(result1.value);
                      message.success("复制成功");
                    }
                  }}
                >
                  {result1.value}
                </div>
              ) : (
                <div>
                  <img className="w-[120px] h-[120px]" src={result1.value} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="w-[1px] mx-4 bg-gray-200"></div>
        <div className="flex-1 relative">
          <textarea
            className="w-full h-24 input"
            placeholder="请输入编码内容 如 Hello"
            value={value2}
            onChange={(event) => {
              const content = event.target.value;
              setValue2(content);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                encode();
                return;
              }
            }}
          />
          <div className="flex">
            <button
              className="py-1 px-4 rounded bg-gray-800 text-white"
              onClick={encode}
            >
              编码
            </button>
            <div className="relative ml-4">
              <button className="z-0 relative py-1 px-4 rounded bg-gray-800 text-white">
                选择图片
              </button>
              <input
                className="z-10 absolute inset-0 opacity-0 cursor-pointer"
                type="file"
                accept="image/*"
                multiple={false}
                onChange={(event) => {
                  const file = event.currentTarget.files?.[0];
                  if (!file) {
                    return;
                  }
                  convertToDataURL(file, "image/png", 1);
                  const reader = new FileReader();
                  reader.onload = (e) => {
                    const base64String = e.target!.result;
                    setResult2({
                      type: "text",
                      value: base64String as string,
                    });
                  };
                  reader.readAsDataURL(file);
                }}
              />
            </div>
            <button
              className="py-1 px-4 rounded text-gray-800 bg-white"
              onClick={() => {
                setValue2("");
                setResult2({
                  type: "text",
                  value: "",
                });
              }}
            >
              清空
            </button>
          </div>
          <div className="flex-1 mt-8">
            <p>编码结果</p>
            <div
              className="matches min-h-24 max-h-78 overflow-y-auto mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded"
              onClick={() => {
                copy(result2.value);
                message.success("复制成功");
              }}
            >
              <div className="break-all">{result2.value}</div>
            </div>
          </div>
          <div className="flex-1 mt-8">
            <div>
              <p>DataURL</p>
            </div>
            <div
              className="matches min-h-24 max-h-78 overflow-y-auto mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded"
              onClick={() => {
                copy(result3.value);
                message.success("复制成功");
              }}
            >
              <div className="break-all">{result3.value}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Base64ParsePage;
