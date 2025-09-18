import { useCallback, useEffect, useRef, useState } from "react";
import qs from "qs";
import copy from "copy-to-clipboard";
import message from "antd/es/message";
import "antd/es/message/style/index";

import { useValue } from "@/hooks";

const CookieParserPage = () => {
  const [url, setUrl] = useValue<string>("");
  const [keyArr, setKeyArr] = useState<{ key: string; value: string }[]>([]);
  const [object, setObject] = useState("");
  const parse = useCallback((url: string) => {
    if (!url) {
      return [];
    }
    const values = url.split(";").map((segment) => {
      const [key, value] = segment.split("=");
      return {
        key,
        value,
      };
    });
    setKeyArr(values);
    return values;
  }, []);

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Cookie Parser</h1>
      <div className="inputs">
        <div className="">
          <textarea
            className="w-full h-24 input"
            placeholder="请输入 cookie 字符串"
            value={url}
            rows={8}
            onChange={setUrl}
          />
          <div className="mt-2 space-x-2">
            <button
              className="py-2 px-4 rounded bg-gray-800 text-white"
              onClick={() => {
                parse(url);
              }}
            >
              解析
            </button>
            {/* <button
              className="py-2 px-4 rounded bg-gray-800 text-white"
              onClick={() => {
                createObject(url);
              }}
            >
              Cookie对象
            </button> */}
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div className="mt-8 space-y-4">
            {keyArr.map(({ key, value }) => {
              return (
                <div key={key}>
                  <div
                    className="text-xl"
                    onClick={() => {
                      copy(value);
                      message.success("复制成功");
                    }}
                  >
                    {key}
                  </div>
                  <div
                    className="text-gray-500 break-all"
                    onClick={() => {
                      copy(value);
                      message.success("复制成功");
                    }}
                  >
                    {value}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            className="mt-8 space-y-4"
            onClick={() => {
              copy(object);
              message.success("复制成功");
            }}
          >
            {object ? (
              <div className="p-2 max-w-full bg-gray-100 rounded break-all">
                {object}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookieParserPage;
