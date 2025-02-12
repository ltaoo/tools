/**
 * @file 文字下标展示
 */
import { useCallback, useState } from "react";

const TextIndexesPage = () => {
  const [text, setText] = useState(
    (() => {
      return localStorage.getItem("text") || "";
    })()
  );
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [sliced, setSliced] = useState("");
  const [nodes, setNodes] = useState<{ text: string; index: number }[]>([]);

  const showTextIndexes = () => {
    if (!text) {
      return;
    }
    const result = text.split("").map((t, i) => {
      return {
        text: t,
        index: i,
      };
    });
    setNodes(result);
  };

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Text Indexes</h1>
      <div className="flex space-x-4 h-18">
        <div className="flex-1">
          <textarea
            className="w-full h-full input"
            placeholder="请输入文本内容"
            value={text}
            onChange={(event) => {
              const content = event.target.value;
              localStorage.setItem("text", content);
              setText(content);
            }}
          />
        </div>
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={showTextIndexes}
        >
          查看
        </button>
      </div>
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              className="input"
              value={start}
              onChange={(event) => {
                const content = event.target.value;
                setStart(content);
              }}
            />
            <input
              className="input"
              value={end}
              onChange={(event) => {
                const content = event.target.value;
                setEnd(content);
              }}
            />
          </div>
          <button
            className="py-1 px-4 rounded bg-gray-800 text-white"
            onClick={() => {
              showTextIndexes();
              if (!text) {
                return;
              }
              if (!start) {
                return;
              }
              const index1 = Number(start);
              const index2 = end ? Number(end) : undefined;
              const r = text.slice(index1, index2);
              setSliced(r);
            }}
          >
            截取
          </button>
          <button
            className="py-1 px-4 rounded"
            onClick={() => {
              setStart("");
              setEnd("");
              setSliced("");
            }}
          >
            重置
          </button>
        </div>
      </div>
      <div className="h-[24px] inline-block border">
        <pre className="inline-block">{sliced}</pre>
      </div>
      <div className="panel ">
        <div className="flex flex-wrap">
          {nodes.map((n) => {
            return (
              <div className="relative">
                <div className="text-center text-3xl">
                  {n.text === " " ? (
                    <span className="bg-gray-200">&nbsp;</span>
                  ) : (
                    <span>{n.text}</span>
                  )}
                </div>
                <div className="px-1 text-gray-500 text-center">{n.index}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TextIndexesPage;
