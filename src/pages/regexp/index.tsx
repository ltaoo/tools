/**
 * @file 正则测试页面
 */
import { useCallback, useState } from "react";

interface IMemory {
  id: number;
  case: string;
  regexp: string;
}
function getMemories(): IMemory[] {
  return JSON.parse(localStorage.getItem("memories") || "[]");
}
function updateMemories(nextMemories: IMemory[]) {
  return localStorage.setItem("memories", JSON.stringify(nextMemories));
}
const RegexpTestPage = () => {
  const [case1, setCase1] = useState(
    (() => {
      const cachedCase1 = localStorage.getItem("case") || "";
      return cachedCase1;
    })()
  );
  const [regexp1, setRegexp1] = useState(
    (() => {
      const cachedCase1 = localStorage.getItem("regexp1") || "";
      return cachedCase1;
    })()
  );
  const [existingMemories, setExistingMemories] = useState(getMemories());
  const [regexp2, setRegexp2] = useState("");
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState([]);
  const [replacement, setReplacement] = useState("");
  const [replaced, setReplaced] = useState("");

  const execMatch = useCallback((content, regexp) => {
    const re1 = new RegExp(regexp, "g");
    const matches = content.match(re1);
    if (matches?.length) {
      setMatches(matches);
    } else {
      setMatches([]);
    }
    const re2 = new RegExp(regexp);
    const matchesAndGroups = content.match(re2);
    if (matchesAndGroups?.length) {
      setGroups(matchesAndGroups.slice(1));
    } else {
      setGroups([]);
    }
  }, []);
  const replaceCase = useCallback((content, regexp, replace) => {
    const re1 = new RegExp(regexp, "g");
    const result = content.replace(re1, replace);
    setReplaced(result);
  }, []);

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Regexp Test</h1>
      <div className="inputs">
        <div className="">
          <textarea
            className="w-full h-24 input"
            placeholder="请输入测试用例"
            value={case1}
            onChange={(event) => {
              const content = event.target.value;
              setCase1(content);
              localStorage.setItem("case", content);
            }}
          />
        </div>
      </div>
      <div className="regexp flex space-x-4">
        <textarea
          className="flex-1 input"
          placeholder="请输入正则"
          value={regexp1}
          onChange={(event) => {
            const content = event.target.value;
            localStorage.setItem("regexp1", content);
            setRegexp1(content);
          }}
        />
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={() => {
            execMatch(case1, regexp1);
          }}
        >
          测试
        </button>
      </div>
      <div className="regexp flex space-x-4">
        <input
          className="flex-1 input"
          placeholder="请输入要替换的内容"
          value={replacement}
          onChange={(event) => {
            const content = event.target.value;
            localStorage.setItem("target", content);
            setReplacement(content);
          }}
        />
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={() => {
            if (!replacement) {
              alert("请输入替换内容");
              return;
            }
            replaceCase(case1, regexp1, replacement);
          }}
        >
          替换
        </button>
      </div>
      <div className="panel grid grid-cols-2 space-x-8">
        <div className="flex-1">
          <p>共找到{matches.length}处匹配</p>
          <div className="matches min-h-24 max-h-78 overflow-y-auto mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded">
            {matches.map((match, i) => {
              return <div key={i} className="break-all">{match}</div>;
            })}
          </div>
        </div>
        <div className="flex-1">
          <p className="">捕获组</p>
          <div className="matches min-h-24 max-h-78 overflow-y-auto mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded">
            {groups.map((group, i) => {
              return <div key={i} className="break-all">{group}</div>;
            })}
          </div>
        </div>
        {replaced && (
          <div className="flex-1">
            <p className="">替换结果</p>
            <div className="matches min-h-24 mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded">
              {replaced}
            </div>
          </div>
        )}
      </div>
      <div className="py-12">
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={() => {
            if (!regexp1) {
              alert("必须输入正则");
              return;
            }
            const existingMemories = getMemories();
            const timestamp = new Date().valueOf();
            const hasSameRegexpAndCase = existingMemories.find((memory) => {
              const { case: c, regexp } = memory;
              if (c === case1 && regexp === regexp1) {
                return true;
              }
              return false;
            });
            if (hasSameRegexpAndCase) {
              alert("已经有相同的测试用例了");
              return;
            }
            const memory = {
              id: timestamp,
              case: case1,
              regexp: regexp1,
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
            const { id, regexp, case: c } = memory;
            return (
              <div key={id} className="">
                <div className="py-2 px-4 bg-gray-100 rounded">
                  <div>{regexp}</div>
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
                          setRegexp1(regexp);
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

export default RegexpTestPage;
