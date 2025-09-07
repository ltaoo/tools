/**
 * @file 视频的 xml 解析
 */
import { useCallback, useEffect, useRef, useState } from "react";
import qs from "qs";
import copy from "copy-to-clipboard";
import message from "antd/es/message";
import "antd/es/message/style/index";

import { useValue } from "@/hooks";

function xmlToJson(doc: Element) {
  // 创建一个空对象来存储结果
  const result: Record<string, any> = {};

  // 如果节点有子节点
  if (doc.children.length > 0) {
    for (let i = 0; i < doc.children.length; i++) {
      const child = doc.children[i];
      const node_name = child.nodeName;

      // 如果结果对象中还没有这个节点名的属性
      if (!result[node_name]) {
        result[node_name] = xmlToJson(child);
      } else {
        // 如果已经存在，则转换为数组
        if (!Array.isArray(result[node_name])) {
          result[node_name] = [result[node_name]];
        }
        result[node_name].push(xmlToJson(child));
      }
    }
  } else {
    // 如果没有子节点，返回节点文本内容
    return doc.textContent;
  }
  return result;
}

const WechatXMLParserPage = () => {
  const [url, setUrl] = useValue<string>("");
  const [pathname, setPathname] = useState("");
  const [xml_result, setXmlResult] = useState("");
  const [keyArr, setKeyArr] = useState<
    {
      key: string;
      value: string;
    }[]
  >([]);
  const [object, setObject] = useState("");
  const parse = useCallback((url) => {
    if (!url) {
      return {};
    }
    const textArea = document.createElement("textarea");
    textArea.innerHTML = url;
    let r = textArea.value;
    const br_regexp = /<br\/>/g;
    const t_regexp = /\\t/g;
    const double_quote_regexp = /\\"/g;
    r = r.replace(br_regexp, "");
    r = r.replace(t_regexp, "");
    r = r.replace(double_quote_regexp, `"`);
    // new XMLSerializer().serializeToString(r);
    // const r = decodeURIComponent(url);
    const parser = new DOMParser();
    const xml_doc = parser.parseFromString(r, "text/xml");
    const result = xmlToJson(xml_doc.documentElement);
    setXmlResult(JSON.stringify(result, null, 2));
    // const result = xmlDoc.documentElement.textContent;
    // setXmlResult(result);
  }, []);
  const createObject = useCallback((url) => {
    // const r = parse(url);
    // const object = r
    //   .map((v) => {
    //     return {
    //       [v.key]: v.value,
    //     };
    //   })
    //   .reduce((a, b) => {
    //     return {
    //       ...a,
    //       ...b,
    //     };
    //   }, {});
    // setObject(JSON.stringify(object, null, 2));
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
              xml对象
            </button>
          </div>
        </div>
        {pathname && <div className="mt-8 text-2xl break-all">{pathname}</div>}
        <div className="grid grid-cols-2">
          <div className="mt-8 space-y-4">
            <pre>{xml_result}</pre>
          </div>
          {/* <div
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
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default WechatXMLParserPage;
