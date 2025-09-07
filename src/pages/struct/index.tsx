/**
 * @file json 转 interface or jsdoc
 */
import { useCallback, useEffect, useRef, useState } from "react";
import cx from "classnames";
import { Tab } from "@headlessui/react";
import copy from "copy-to-clipboard";
import message from "antd/es/message";
import "antd/es/message/style/index";

import { parse } from "@/utils/json/ast";
import { useHistoryRecords, useValue } from "@/hooks";
import LazyEditor from "@/components/LazyEditor";
import { toJSONSchema } from "@/utils/json";
import {
  json2Interface,
  json2JSDoc,
  jsonSchema2Interface,
  jsonSchema2JSDoc,
} from "@/utils/typescript";
import {
  buildExampleCode,
  buildGolangExampleCode,
} from "@/utils/typescript/example";
import { jsEnumPlugin, tsEnumPlugin } from "@/utils/typescript/plugins/enum";

const ReplPage = () => {
  const [code, setCode] = useValue(
    (() => {
      const cachedCode = localStorage.getItem("struct") || "";
      return cachedCode;
    })(),
    {
      onChange: (v) => {
        localStorage.setItem("struct", v);
      },
    }
  );
  const [records, recordManage] = useHistoryRecords("struct-page");
  const codeRef = useRef(code);
  const refTSInterface = useRef("");
  const refJSDoc = useRef("");
  const refGolang = useRef("");
  const [rTSInterface, setInterfaceStr] = useState("");
  const [rJSDoc, setJSDocStr] = useState("");
  const [rGolangStruct, setGolangStr] = useState("");

  const convert = useCallback((codeString) => {
    if (!codeString) {
      return;
    }
    try {
      const regexp = /([0-9a-z]{1,})[：:]{1}([^;；]{1,})[;；]{1}/;
      const tsLifetimes = tsEnumPlugin(regexp);
      const jsLifetimes = jsEnumPlugin(regexp);
      refTSInterface.current = json2Interface(codeString, {
        plugin: tsLifetimes,
      });
      refJSDoc.current = json2JSDoc(codeString, {
        plugin: jsLifetimes,
      });
      const ast = parse(codeString);
      const schema = toJSONSchema(ast);
      const interStr = buildExampleCode(schema, {
        language: "ts",
        lifetimes: tsLifetimes,
      });
      setInterfaceStr(interStr);
      const jsdoc = buildExampleCode(schema, {
        language: "js",
        lifetimes: jsLifetimes,
      });
      setJSDocStr(jsdoc);
      const golangStr = buildGolangExampleCode(schema, {
        language: "ts",
        lifetimes: tsLifetimes,
      });
      setGolangStr(golangStr);
    } catch (err) {
      console.log(err);
      // @ts-ignore
      alert(err.message);
    }
  }, []);

  const elms: Record<string, React.ReactNode> = {
    "TypeScript interface": rTSInterface ? (
      <div className="relative">
        <LazyEditor key="ts" language="typescript" value={rTSInterface} />
        <div
          className="btn absolute right-10 top-4"
          onClick={() => {
            if (refTSInterface.current) {
              copy(refTSInterface.current);
              message.success("复制成功");
            }
          }}
        >
          复制
        </div>
      </div>
    ) : null,
    JSDoc: rJSDoc ? (
      <div className="relative">
        <LazyEditor key="js" language="javascript" value={rJSDoc} />
        <div
          className="btn absolute right-10 top-4"
          onClick={() => {
            if (refJSDoc.current) {
              copy(refJSDoc.current);
              message.success("复制成功");
            }
          }}
        >
          复制
        </div>
      </div>
    ) : null,
    "Golang struct": rGolangStruct ? (
      <div className="relative">
        <LazyEditor key="golang" language="go" value={rGolangStruct} />
        <div
          className="btn absolute right-10 top-4"
          onClick={() => {
            if (refJSDoc.current) {
              copy(refJSDoc.current);
              message.success("复制成功");
            }
          }}
        >
          复制
        </div>
      </div>
    ) : null,
    History: (
      <div>
        <div className="mt-2 space-y-4 max-h-36 overflow-y-auto">
          {records.map((memory) => {
            const { id, content } = memory;
            return (
              <div key={id} className="">
                <div className="py-2 px-4 bg-gray-100 rounded">
                  <div>{content}</div>
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-gray-400">
                      <span>{new Date(id).toLocaleDateString()}</span>
                      <span className="ml-4">
                        {new Date(id).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="space-x-2">
                      <button
                        className="py-1 px-2 text-sm rounded bg-gray-800 text-white"
                        onClick={() => {
                          setCode(content);
                        }}
                      >
                        使用
                      </button>
                      <button
                        className="py-1 px-2 text-sm rounded bg-gray-800 text-white"
                        onClick={() => {
                          recordManage.remove(id);
                        }}
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    ),
  };

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Struct Converter</h1>
      <div className="mt-6">
        <LazyEditor
          value={code as string}
          language="json5"
          onChange={(nextCode) => {
            codeRef.current = nextCode;
            localStorage.setItem("struct", nextCode);
          }}
        />
        <div className="mt-4">
          <div className="flex space-2">
            <div
              className="mt-2 btn btn--large btn--primary"
              onClick={() => {
                convert(codeRef.current);
              }}
            >
              转换
            </div>
            <div
              className="mt-2 btn btn--large btn--primary"
              onClick={() => {
                recordManage.push(codeRef.current);
              }}
            >
              暂存
            </div>
          </div>
        </div>
        <div className="mt-4">
          <Tab.Group>
            <Tab.List className="inline-flex space-x-2 rounded-xl bg-black p-1">
              {Object.keys(elms).map((key) => (
                <Tab
                  key={key}
                  className={({ selected }) =>
                    cx(
                      "px-4 rounded-lg py-2.5 text-sm font-medium leading-5 text-white",
                      "focus:outline-none",
                      selected
                        ? "bg-white text-black shadow"
                        : "text-white hover:bg-white/[0.12] hover:text-white"
                    )
                  }
                >
                  {key}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-2">
              <div className="p-4 w-full min-h-[540px] overflow-x-auto bg-[#c1c1c1]">
                {Object.keys(elms).map((key) => (
                  <Tab.Panel key={key}>{elms[key]}</Tab.Panel>
                ))}
              </div>
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default ReplPage;
