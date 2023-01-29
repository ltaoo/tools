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
import { useValue } from "@/hooks";
import LazyEditor from "@/components/LazyEditor";
import { toJSONSchema } from "@/utils/json";
import { jsonSchema2Interface, jsonSchema2JSDoc } from "@/utils/typescript";
import { buildExampleCode } from "@/utils/typescript/example";

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
  // const [astJSON, setAstJSON] = useState("");
  // const [schemaJSON, setSchemaJSON] = useState("");
  const interfaceRef = useRef("");
  const jsdocRef = useRef("");
  const [interfaceStr, setInterfaceStr] = useState("");
  const [JSDocStr, setJSDocStr] = useState("");

  const convert = useCallback((codeString) => {
    if (!codeString) {
      return;
    }
    try {
      const ast = parse(codeString);
      const schema = toJSONSchema(ast);
      interfaceRef.current = jsonSchema2Interface(schema);
      jsdocRef.current = jsonSchema2JSDoc(schema);
      const interStr = buildExampleCode(schema, {
        language: "ts",
      });
      setInterfaceStr(interStr);
      const jsdoc = buildExampleCode(schema, {
        language: "js",
      });
      setJSDocStr(jsdoc);
    } catch (err) {
      alert(err.message);
    }
  }, []);

  const elms: Record<string, React.ReactNode> = {
    "TypeScript interface": interfaceStr ? (
      <div className="relative">
        <LazyEditor key="ts" language="typescript" value={interfaceStr} />
        <div
          className="btn absolute right-10 top-4"
          onClick={() => {
            if (interfaceRef.current) {
              copy(interfaceRef.current);
              message.success("复制成功");
            }
          }}
        >
          复制
        </div>
      </div>
    ) : null,
    JSDoc: JSDocStr ? (
      <div className="relative">
        <LazyEditor key="js" language="javascript" value={JSDocStr} />
        <div
          className="btn absolute right-10 top-4"
          onClick={() => {
            if (jsdocRef.current) {
              copy(jsdocRef.current);
              message.success("复制成功");
            }
          }}
        >
          复制
        </div>
      </div>
    ) : null,
    // Example: <div>Example</div>,
  };

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Struct Converter</h1>
      <div className="mt-6">
        <LazyEditor
          value={code as string}
          language="json5"
          onChange={setCode}
        />
        <div className="mt-4">
          <div
            className="mt-2 btn btn--large btn--primary"
            onClick={() => {
              convert(code);
            }}
          >
            转换
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
