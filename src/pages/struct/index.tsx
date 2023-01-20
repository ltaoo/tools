/**
 * @file JavaScript 在线执行
 */
import { useCallback, useState } from "react";
import cx from "classnames";
import { Tab } from "@headlessui/react";

import { generateFn, safeInvokeWrap } from "@/utils";
import { parse } from "@/utils/json/ast";
import { useValue } from "@/hooks";
import Editor from "@/components/SuperEditor";
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
  const [interfaceStr, setInterfaceStr] = useState("");
  const [JSDocStr, setJSDocStr] = useState("");

  const convert = useCallback((codeString) => {
    const language = "json";
    const ast = parse(codeString);
    // setAstJSON(JSON.stringify(ast, null, 2));
    const schema = toJSONSchema(ast);
    // setSchemaJSON(JSON.stringify(schema, null, 2));
    const interStr = buildExampleCode(schema, {
      language: "ts",
    });
    setInterfaceStr(interStr);
    const jsdoc = buildExampleCode(schema, {
      language: "js",
    });
    console.log(jsdoc);
    setJSDocStr(jsdoc);
  }, []);

  const elms: Record<string, React.ReactNode> = {
    "TypeScript interface": interfaceStr ? (
      <div>
        <Editor key="ts" language="typescript" defaultValue={interfaceStr} />
      </div>
    ) : null,
    JSDoc: JSDocStr ? (
      <div>
        <Editor key="js" language="javascript" defaultValue={JSDocStr} />
      </div>
    ) : null,
    Example: <div>Example</div>,
  };

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Struct Converter</h1>
      <div className="mt-6">
        <Editor
          defaultValue={code as string}
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
