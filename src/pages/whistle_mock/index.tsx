/**
 * @file Whistle mock 规则生成
 */
import { useCallback, useState, useEffect, useRef } from "react";
import copy from "copy-to-clipboard";
import message from "antd/es/message";
import "antd/es/message/style/index";

import { base, Handler } from "@/domains/base";
import { RequestBuilderModel } from "@/domains/request_builder/request_builder";

import { useViewModel } from "@/hooks";

function WhistleMockViewModel(props: {}) {
  const methods = {
    refresh() {
      bus.emit(Events.StateChange, { ..._state });
    },
    parseCURL(content: string) {},
    buildWhistleMock(curl: string, response: string) {
      const r = ui.$builder.parseCURLCommand(curl);
      const whistle_value_filename = (() => {
        const { pathname } = new window.URL(r.url);
        return pathname.replace(/\//g, "_") + ".json";
      })();
      _error = null;
      _rule_text = `${r.url} statusCode://200
${r.url} resHeaders://{cors}
${r.url} resBody://{${whistle_value_filename}}`;
      _value_filename = whistle_value_filename;
      try {
        _value_text = JSON.stringify(JSON.parse(response), null, 2);
      } catch (err) {
        _error = err as Error;
      }
      methods.refresh();
    },
  };
  const ui = {
    $builder: RequestBuilderModel({}),
  };

  let _rule_text = "";
  let _value_filename = "";
  let _value_text = "";
  let _error: Error | null = null;
  const _state = {
    get rule() {
      return _rule_text;
    },
    get file() {
      return {
        name: _value_filename,
        content: _value_text,
      };
    },
    get error() {
      return _error;
    },
  };

  enum Events {
    StateChange,
  }
  type TheTypesOfEvents = {
    [Events.StateChange]: typeof _state;
  };
  const bus = base<TheTypesOfEvents>();

  ui.$builder.onStateChange(() => methods.refresh());

  return {
    methods,
    state: _state,
    ready() {},
    destroy() {
      bus.destroy();
    },
    onStateChange(handler: Handler<TheTypesOfEvents[Events.StateChange]>) {
      return bus.on(Events.StateChange, handler);
    },
  };
}
export type CURLParseViewModel = ReturnType<typeof WhistleMockViewModel>;

interface IMemory {
  id: number;
  case: string;
}
const MemoryKeyScope = "page_whistle_mock";
const MemoryKeyCURL = MemoryKeyScope + "_curl";
const MemoryKeyResponse = MemoryKeyScope + "_response";
function getMemories(): IMemory[] {
  return JSON.parse(localStorage.getItem(MemoryKeyScope) || "[]");
}
function updateMemories(nextMemories: IMemory[]) {
  return localStorage.setItem(MemoryKeyScope, JSON.stringify(nextMemories));
}
export default function WhistleMockPage() {
  const [curl, setCURL] = useState(localStorage.getItem(MemoryKeyCURL) || "");
  const [response, setResponse] = useState(
    localStorage.getItem(MemoryKeyResponse) || "",
  );
  const [existingMemories, setExistingMemories] = useState(getMemories());

  const [state, vm] = useViewModel(WhistleMockViewModel, [{}]);

  function generateWhistleMock() {
    vm.methods.buildWhistleMock(curl, response);
    localStorage.setItem(MemoryKeyCURL, curl);
    localStorage.setItem(MemoryKeyResponse, response);
  }
  function saveInputs() {
    if (!curl) {
      alert("必须输入 curl");
      return;
    }
    if (!response) {
      alert("必须输入 curl");
      return;
    }
    const existingMemories = getMemories();
    const timestamp = new Date().valueOf();
    const hasSameMemory = existingMemories.find((memory) => {
      const { case: c } = memory;
      if (c === curl) {
        return true;
      }
      return false;
    });
    if (hasSameMemory) {
      alert("已经有相同的 curl");
      return;
    }
    const memory = {
      id: timestamp,
      case: curl,
    };
    const nextMemories = [memory, ...existingMemories];
    updateMemories(nextMemories);
    setExistingMemories(nextMemories);
  }

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Whistle Mock</h1>
      <div className="inputs">
        <div className="flex gap-2">
          <textarea
            className="w-full h-24 input"
            placeholder="请输入curl"
            value={curl}
            onChange={(event) => {
              setCURL(event.target.value);
            }}
          />
          <textarea
            className="w-full h-24 input"
            placeholder="请输入response"
            value={response}
            onChange={(event) => {
              setResponse(event.target.value);
            }}
          />
        </div>
      </div>
      <div className="regexp flex space-x-2">
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={generateWhistleMock}
        >
          生成
        </button>
        {/* <button className="py-1 px-4 rounded text-black" onClick={saveInputs}>
          暂存
        </button> */}
      </div>
      <div className="panel">
        <div className="mb-4">
          <p className="text-lg">解析结果</p>
          {state.error ? <div>{state.error.message}</div> : null}
          {state.rule ? (
            <div className="flex gap-2">
              <div
                className="overflow-x-auto flex-1 p-2 rounded-md border border-gray-300"
                onClick={() => {
                  copy(state.rule);
                  message.success("规则复制成功");
                }}
              >
                <pre>{state.rule}</pre>
              </div>
              <div className="flex-1 w-0 space-y-2">
                <div className="p-2 rounded-md border border-gray-300">
                  <div
                    onClick={() => {
                      copy(state.file.name);
                      message.success("文件名复制成功");
                    }}
                  >
                    {state.file.name}
                  </div>
                </div>
                <div
                  className="overflow-auto p-2 w-full max-h-[240px] rounded-md border border-gray-300"
                  onClick={() => {
                    copy(state.file.content);
                    message.success("JSON内容复制成功");
                  }}
                >
                  <pre>{state.file.content}</pre>
                </div>
              </div>
            </div>
          ) : null}
          {/* <div className="flex space-x-2">
            <button
              className="py-2 px-3 rounded bg-blue-500 text-white text-sm"
              onClick={() => {
                if (editor) {
                  editor.canvas.setZoom(1);
                  editor.canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
                  editor.canvas.renderAll();
                }
              }}
            >
              重置视图
            </button>
            <button
              className="py-2 px-3 rounded bg-green-500 text-white text-sm"
              onClick={() => {
                if (editor) {
                  const zoom = editor.canvas.getZoom();
                  editor.canvas.setZoom(zoom * 1.2);
                  editor.canvas.renderAll();
                }
              }}
            >
              放大
            </button>
            <button
              className="py-2 px-3 rounded bg-yellow-500 text-white text-sm"
              onClick={() => {
                if (editor) {
                  const zoom = editor.canvas.getZoom();
                  editor.canvas.setZoom(zoom * 0.8);
                  editor.canvas.renderAll();
                }
              }}
            >
              缩小
            </button>
          </div> */}
        </div>
        {/* <div
          style={{
            width: "800px",
            height: "800px",
            border: "2px solid #e5e7eb",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          <FabricJSCanvas className="sample-canvas" onReady={onReady} />
        </div> */}
      </div>
      {/* <div className="py-12">
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
                          setCURL(c);
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
      </div> */}
    </div>
  );
}
