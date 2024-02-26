import { useCallback, useEffect, useRef, useState } from "react";
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
  const [object, setObject] = useState("");
  const parse = useCallback((url) => {
    if (!url) {
      return [];
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
    return values;
  }, []);
  const createObject = useCallback((url) => {
    const r = parse(url);
    const object = r
      .map((v) => {
        return {
          [v.key]: v.value,
        };
      })
      .reduce((a, b) => {
        return {
          ...a,
          ...b,
        };
      }, {});
    setObject(JSON.stringify(object, null, 2));
  }, []);

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
          <div className="mt-2 space-x-2">
            <button
              className="py-2 px-4 rounded bg-gray-800 text-white"
              onClick={() => {
                parse(url);
              }}
            >
              解析
            </button>
            <button
              className="py-2 px-4 rounded bg-gray-800 text-white"
              onClick={() => {
                createObject(url);
              }}
            >
              query对象
            </button>
          </div>
        </div>
        {pathname && <div className="mt-8 text-2xl break-all">{pathname}</div>}
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

export default URLQueryParserPage;
