import { useEffect, useRef, useState } from "react";
import qs from "qs";
import copy from "copy-to-clipboard";
import message from "antd/es/message";
import "antd/es/message/style/index";

import { useValue } from "@/hooks";

const URLQueryParserPage = () => {
  const [url, setUrl] = useValue<string>("");
  const [pathname, setPathname] = useState("");
  const [keyArr, setKeyArr] = useState<
    {
      key: string;
      value: string;
    }[]
  >([]);

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">URL search</h1>
      <div className="inputs">
        <div className="">
          <textarea
            className="w-full h-24 input"
            placeholder="请输入 url"
            value={url}
            rows={8}
            onChange={setUrl}
          />
          <button
            className="py-1 px-4 rounded bg-gray-800 text-white"
            onClick={() => {
              if (!url) {
                return;
              }
              let search = decodeURIComponent(url);
              if (url.includes("?")) {
                const [path, searchStr] = url.split("?");
                search = searchStr;
                setPathname(path);
              }
              const result = qs.parse(search, { ignoreQueryPrefix: false });
              const values = Object.keys(result).map((k) => {
                return {
                  key: k,
                  value: result[k] as string,
                };
              });
              setKeyArr(values);
            }}
          >
            解析
          </button>
        </div>
        {pathname && <div className="mt-8 text-2xl break-all">{pathname}</div>}
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
      </div>
    </div>
  );
};

export default URLQueryParserPage;
