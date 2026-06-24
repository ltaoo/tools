/**
 * @file 正则测试页面
 */
import { useCallback, useRef, useState } from "react";

import { copy } from "../../utils";

interface IMemory {
  id: number;
  case: string;
  regexp: string;
}
interface IResultPanelProps {
  title: string;
  description: string;
  countLabel: string;
  items: string[];
  emptyText: string;
  toneClassName: string;
  badgeClassName: string;
  itemPrefix: string;
  activeClassName: string;
  activeButtonClassName: string;
}
function getMemories(): IMemory[] {
  return JSON.parse(localStorage.getItem("memories") || "[]");
}
function updateMemories(nextMemories: IMemory[]) {
  return localStorage.setItem("memories", JSON.stringify(nextMemories));
}

const ResultPanel = (props: IResultPanelProps) => {
  const {
    title,
    description,
    countLabel,
    items,
    emptyText,
    toneClassName,
    badgeClassName,
    itemPrefix,
    activeClassName,
    activeButtonClassName,
  } = props;
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const jumpToItem = useCallback((index: number) => {
    setActiveIndex(index);
    itemRefs.current[index]?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);
  const copyItem = useCallback(async (text: string, index: number) => {
    let success = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        success = true;
      } else {
        success = copy(text);
      }
    } catch (error) {
      success = copy(text);
    }

    if (!success) {
      alert("复制失败");
      return;
    }
    setCopiedIndex(index);
    window.setTimeout(() => {
      setCopiedIndex((prev) => (prev === index ? null : prev));
    }, 1200);
  }, []);

  return (
    <section
      className={`min-w-0 rounded border bg-white overflow-hidden ${toneClassName}`}
    >
      <div className="flex items-start justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900">{title}</p>
          <p className="mt-1 text-xs text-gray-500">{description}</p>
        </div>
        <span
          className={`flex-shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badgeClassName}`}
        >
          {countLabel}
        </span>
      </div>
      {items.length > 1 && (
        <div className="border-b border-gray-200 bg-white px-4 py-2">
          <div className="flex items-center gap-2">
            <span className="flex-shrink-0 text-xs text-gray-500">
              快速跳转
            </span>
            <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto pb-1">
              {items.map((_, i) => {
                const active = activeIndex === i;
                return (
                  <button
                    key={i}
                    type="button"
                    title={`跳转到${title} ${itemPrefix}${i + 1}`}
                    className={`rounded border px-2 py-0.5 font-mono text-xs whitespace-nowrap ${
                      active
                        ? activeButtonClassName
                        : "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
                    }`}
                    onClick={() => jumpToItem(i)}
                  >
                    {itemPrefix}
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className="min-h-28 max-h-80 overflow-y-auto bg-gray-50">
        {items.length ? (
          <div className="divide-y divide-gray-200">
            {items.map((item, i) => {
              return (
                <div
                  key={i}
                  ref={(node) => {
                    itemRefs.current[i] = node;
                  }}
                  className={`flex gap-3 px-4 py-2.5 ${
                    activeIndex === i ? activeClassName : ""
                  }`}
                >
                  <span className="w-14 flex-shrink-0 font-mono text-xs leading-6 text-gray-400">
                    {itemPrefix}
                    {i + 1}
                  </span>
                  <code className="min-w-0 flex-1 whitespace-pre-wrap break-all rounded bg-white px-2 py-1 font-mono text-sm text-gray-900">
                    {item}
                  </code>
                  <button
                    type="button"
                    className="h-7 flex-shrink-0 rounded border border-gray-200 bg-white px-2 text-xs text-gray-600 hover:bg-gray-100"
                    onClick={() => copyItem(item, i)}
                  >
                    {copiedIndex === i ? "已复制" : "复制"}
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex min-h-28 items-center justify-center px-4 text-sm text-gray-400">
            {emptyText}
          </div>
        )}
      </div>
    </section>
  );
};

const RegexpTestPage = () => {
  const [case1, setCase1] = useState(
    (() => {
      const cachedCase1 = localStorage.getItem("case") || "";
      return cachedCase1;
    })(),
  );
  const [regexp1, setRegexp1] = useState(
    (() => {
      const cachedCase1 = localStorage.getItem("regexp1") || "";
      return cachedCase1;
    })(),
  );
  const [existingMemories, setExistingMemories] = useState(getMemories());
  const [groups, setGroups] = useState<string[]>([]);
  const [matches, setMatches] = useState<string[]>([]);
  const [replacement, setReplacement] = useState("");
  const [replaced, setReplaced] = useState("");

  const execMatch = useCallback((content: string, regexp: string) => {
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
  const replaceCase = useCallback(
    (content: string, regexp: string, replace: string) => {
      const re1 = new RegExp(regexp, "g");
      const result = content.replace(re1, replace);
      setReplaced(result);
    },
    [],
  );

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
      <div className="panel grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ResultPanel
          title="匹配结果"
          description="全局匹配到的完整片段"
          countLabel={`${matches.length} 处`}
          items={matches}
          emptyText="暂无匹配结果"
          toneClassName="border-blue-200 border-l-4"
          badgeClassName="bg-blue-100 text-blue-700"
          itemPrefix="#"
          activeClassName="bg-blue-50"
          activeButtonClassName="border-blue-500 bg-blue-50 text-blue-700"
        />
        <ResultPanel
          title="捕获组"
          description="首个匹配中的括号捕获内容"
          countLabel={`${groups.length} 组`}
          items={groups}
          emptyText="暂无捕获组"
          toneClassName="border-amber-200 border-l-4"
          badgeClassName="bg-amber-100 text-amber-700"
          itemPrefix="$"
          activeClassName="bg-amber-50"
          activeButtonClassName="border-amber-500 bg-amber-50 text-amber-700"
        />
        {replaced && (
          <div className="lg:col-span-2">
            <p className="">替换结果</p>
            <div className="matches min-h-24 mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded whitespace-pre-wrap break-all">
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
                            (memory) => memory.id !== id,
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
