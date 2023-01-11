/**
 * @file JavaScript 在线执行
 */
import { useCallback, useState } from "react";

import { generateFn, safeInvokeWrap } from "@/utils";
import { parse } from "@/utils/json/ast";
import { useValue } from "@/hooks";
import Editor from "@/components/editor";
import { toJSONSchema } from "@/utils/json";

const ReplPage = () => {
  const [code, setCode] = useValue("", {});
  const [astJSON, setAstJSON] = useState("");
  const [schemaJSON, setSchemaJSON] = useState("");

  const convert = useCallback((codeString) => {
    const language = "json";
    const ast = parse(codeString);
    setAstJSON(JSON.stringify(ast, null, 2));
    const schema = toJSONSchema(ast);
    setSchemaJSON(JSON.stringify(schema, null, 2));
  }, []);

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Struct Converter</h1>
      <div className="mt-6">
        <textarea
          className="w-full h-[360px] input"
          value={code}
          onChange={setCode}
        />
        <div className="mt-4">
          <div
            className="mt-2 btn btn--primary"
            onClick={() => {
              convert(code);
            }}
          >
            转换
          </div>
        </div>
        <div className="flex">
          <div className="p-4 max-w-[240px] overflow-x-auto rounded bg-[#c1c1c1]">
            <pre>
              <code>{astJSON}</code>
            </pre>
          </div>
          <div className="p-4 max-w-[240px] overflow-x-auto rounded bg-[#c1c1c1]">
            <pre>
              <code>{schemaJSON}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReplPage;
