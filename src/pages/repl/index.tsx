/**
 * @file JavaScript 在线执行
 */
import { useCallback, useState } from "react";

import { generateFn, safeInvokeWrap } from "@/utils";
import { useValue } from "@/hooks";
import Editor from "@/components/SuperEditor";

const ReplPage = () => {
  const [logs, setLogs] = useState<any[]>([]);

  const [code, setCode] = useValue(
    (() => {
      const cachedJavaScriptCode = localStorage.getItem("javascript") || "";
      return cachedJavaScriptCode;
    })(),
    {
      onChange: (v) => {
        localStorage.setItem("javascript", v);
      },
    }
  );

  const execCode = useCallback(async (code) => {
    const fn = generateFn(code);
    try {
      const result = (await safeInvokeWrap(2000)(fn)) as any[];
      setLogs(result);
    } catch (err: any) {
      alert(err.message);
    }
  }, []);

  const renderLog = useCallback((log) => {
    if (typeof log === "object") {
      return JSON.stringify(log, null, 2);
    }
    return log;
  }, []);

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">JavaScript Repl</h1>
      <div className="mt-6">
        <Editor defaultValue={code as string} onChange={setCode} />
        <div className="mt-4">
          <div
            className="mt-2 btn btn--primary"
            onClick={() => {
              execCode(code);
            }}
          >
            执行
          </div>
        </div>
        <div className="mt-6 space-y-1 divide-y">
          {logs.map((log, i) => {
            return (
              <div key={i} className="py-1 px-2">
                {renderLog(log)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ReplPage;
