/**
 * @file 书源制作页面
 */
import { useCallback, useState } from "react";
import { IContentExtract } from "./types";
import { m } from "./utils";

/**
 * 清理 html 无用字符
 * @param html
 * @returns
 */
export function cleanHTML(html: string) {
  return html
    .replace(/<script[\s\S]{0,}?>[\s\S]{0,}?<\/script>/g, "")
    .replace(/<style[^>]{1,}?>[\s\S]{0,}?<\/style>/g, "")
    .replace(/<link[^>]{0,}>[\s\S]{1,}?(<\/link>){0,1}/g, "")
    .replace(/(?<=<[^>]{1,}>)([\s]{0,})(?=<)/g, "")
    .replace(/<svg[^>]{0,}?>[\s\S]{1,}?<\/svg>/g, "")
    .replace(/<!--[\s\S]{1,}?-->/g, "");
}

const BookSourceBuildPage = () => {
  const [html, setHTML] = useState("");
  const [sourceStr, setSourceStr] = useState("");
  const [source, setSource] = useState<null | {
    extract: {
      [key: string]: {
        [key: string]: {
          r: string;
        };
      };
    };
  }>(null);
  const [page, setCurPage] = useState("");
  const [result, setResult] = useState<null | Record<string, any>>(null);

  const parseSource = useCallback((source) => {
    try {
      const s = JSON.parse(source);
      setSource(s);
    } catch (err) {
      // ...
      alert("Parse book source failed.");
    }
  }, []);
  const extract = useCallback((html, ofPage) => {
    let dataSource: null | string | string[] = [];
    const { data_source, ...rest } = ofPage;
    if (data_source) {
      console.log(ofPage["data_source"]);
      dataSource = m(html)(ofPage["data_source"], "g");
    }
    console.log("[LOG] Search result is: ", dataSource?.length);
    console.log();

    if (dataSource === null) {
      return;
    }
    const result = [];
    for (let i = 0; i < dataSource.length; i += 1) {
      const content = dataSource[i];
      const mm = m(content);
      const re = Object.keys(rest)
        .map((con) => {
          return {
            [con]: mm(ofPage[con]),
          };
        })
        .reduce((total, cur) => {
          return {
            ...total,
            ...cur,
          };
        }, {});
      result.push(re);
    }
    console.log(result);
    setResult(result);
  }, []);

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">书源制作</h1>
      <div className="inputs">
        <div className="">
          <textarea
            className="w-full h-12 input"
            placeholder="输入 html"
            value={html}
            onChange={(event) => {
              const content = event.target.value;
              setHTML(content);
              localStorage.setItem("case", content);
            }}
          />
          <div className="py-2 px-2 h-60 bg-gray-100 overflow-y-auto rounded">
            {cleanHTML(html)}
          </div>
        </div>
      </div>
      <div className="regexp flex space-x-4">
        <textarea
          className="flex-1 input"
          placeholder="请输入正则"
          value={sourceStr}
          onChange={(event) => {
            const content = event.target.value;
            setSourceStr(content);
          }}
        />
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={() => {
            parseSource(sourceStr);
          }}
        >
          解析书源
        </button>
      </div>
      {source && (
        <div className="flex space-x-2">
          <select
            className="input w-32"
            onChange={(event) => {
              setCurPage(event.target.value);
            }}
          >
            <option>请选择</option>
            {Object.keys(source.extract).map((page) => {
              return <option key={page}>{page}</option>;
            })}
          </select>
          <button
            className="btn btn--primary"
            onClick={() => {
              if (!page) {
                return;
              }
              extract(cleanHTML(html), source.extract[page]);
            }}
          >
            测试
          </button>
        </div>
      )}
      {source && page && (
        <div className="w-full space-y-4">
          {Object.keys(source.extract[page]).map((con, i) => {
            return (
              <div key={con + page}>
                {con}
                <input
                  className="input w-full"
                  value={source.extract[page][con].r}
                  onChange={(event) => {
                    setSource((prev) => {
                      if (prev === null) {
                        return prev;
                      }
                      return {
                        ...prev,
                        extract: {
                          ...prev.extract,
                          [page]: {
                            ...prev.extract[page],
                            [con]: {
                              ...prev.extract[page][con],
                              r: event.target.value,
                            },
                          },
                        },
                      };
                    });
                  }}
                />
              </div>
            );
          })}
        </div>
      )}
      {result !== null && (
        <pre className="mt-4">{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
};

export default BookSourceBuildPage;
