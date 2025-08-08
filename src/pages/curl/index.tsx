/**
 * @file curl 解析
 */
import { useCallback, useState } from "react";

import { parse } from "./curl_parser";

interface IMemory {
  id: number;
  case: string;
}
const MemoryKey = "page_curl";
function getMemories(): IMemory[] {
  return JSON.parse(localStorage.getItem(MemoryKey) || "[]");
}
function updateMemories(nextMemories: IMemory[]) {
  return localStorage.setItem(MemoryKey, JSON.stringify(nextMemories));
}
const CurlParsePage = () => {
  const [case1, setCase1] = useState(
    (() => {
      const cachedCase1 = localStorage.getItem("curl") || "";
      return cachedCase1;
    })()
  );
  const [existingMemories, setExistingMemories] = useState(getMemories());
  const [result, setResult] = useState<null | ReturnType<typeof parse>>(null);
  const [resultText, setResultText] = useState<string>("");

  const parseCurl = useCallback((content) => {
    const r = parse(content);
    setResult(r);
    setResultText(JSON.stringify(r, null, 2));
  }, []);

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Curl Parse</h1>
      <div className="inputs">
        <div className="">
          <textarea
            className="w-full h-24 input"
            placeholder="请输入curl"
            value={case1}
            onChange={(event) => {
              const content = event.target.value;
              setCase1(content);
            }}
          />
        </div>
      </div>
      <div className="regexp flex space-x-4">
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={() => {
            parseCurl(case1);
          }}
        >
          解析
        </button>
      </div>
      <div className="panel">
        {result && (
          <div className="flex-1">
            <p className="">解析结果</p>
            <div className="matches overflow-x-auto min-h-24 mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded">
              <pre>{resultText}</pre>
            </div>
          </div>
        )}
      </div>
      <div className="py-12">
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={() => {
            if (!case1) {
              alert("必须输入 curl");
              return;
            }
            const existingMemories = getMemories();
            const timestamp = new Date().valueOf();
            const hasSameRegexpAndCase = existingMemories.find((memory) => {
              const { case: c } = memory;
              if (c === case1) {
                return true;
              }
              return false;
            });
            if (hasSameRegexpAndCase) {
              alert("已经有相同的 curl");
              return;
            }
            const memory = {
              id: timestamp,
              case: case1,
            };
            const nextMemories = [memory, ...existingMemories];
            updateMemories(nextMemories);
            setExistingMemories(nextMemories);
          }}
        >
          暂存
        </button>
        <p className="mt-6">历史记录</p>
        <div className="mt-2 space-y-4">
          {existingMemories.map((memory) => {
            const { id, case: c } = memory;
            return (
              <div key={id} className="">
                <div className="py-2 px-4 bg-gray-100 rounded">
                  <div>{c}</div>
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
                          setCase1(c);
                        }}
                      >
                        恢复
                      </button>
                      <button
                        className="py-1 px-2 text-sm rounded bg-gray-800 text-white"
                        onClick={() => {
                          const nextMemories = existingMemories.filter(
                            (memory) => memory.id !== id
                          );
                          updateMemories(nextMemories);
                          setExistingMemories(nextMemories);
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
    </div>
  );
};

export default CurlParsePage;
