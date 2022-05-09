/**
 * @file 正则构建器
 */
import { useEffect, useState } from "react";

import { copy } from "@/utils";
import { useValue, useVisible } from "@/hooks";
import MultipleCharInput, {
  IMatchedOption,
  MatchedType,
} from "@/components/CharInput";
import NumInput, { INum, validateNum } from "@/components/NumInput";
import TextSelect from "@/components/TextSelect";

import {
  IDescription,
  getTextAndChars,
  getTextAndNumRange,
  buildPattern,
  updateDescription,
  getDescription,
} from "./utils";

interface INode {
  // p 模式 h 语义 c 限制
  type: "p" | "h" | "c";
  data: IDescription | string;
}
function renderNodes(nodes: INode[]) {
  let result = "";
  let i = 0;
  let node = nodes[i];
  while (node) {
    const { type, data } = node;
    if (data === "以 pattern 开头") {
      result += data;
    }
    if (data === "跟着 pattern") {
      result += data;
    }
    if (data === "以 pattern 结尾") {
      result += data;
    }
    if (data === "包含 pattern") {
      result += data;
    }
    if (data === "不包含 pattern") {
      result += data;
    }
    if (type === "p") {
      const d = buildPattern(data as IDescription);
      result = result.replace(/pattern/, d);
    }
    i += 1;
    node = nodes[i];
  }
  return result;
}

function renderRegexp(nodes: INode[]) {
  let result = "";
  let i = 0;
  let node = nodes[i];
  while (node) {
    const { type, data } = node;
    if (data === "以 pattern 开头") {
      result += "pattern";
    }
    if (data === "跟着 pattern") {
      result += "pattern";
    }
    if (data === "以 pattern 结尾") {
      result += "pattern";
    }
    if (data === "包含 pattern") {
      const startNodeIndex = nodes.findIndex(
        (node) => node.data === "以 pattern 开头"
      );
      if (startNodeIndex !== -1) {
        const s = nodes[startNodeIndex + 1];
        const d = buildPattern(s.data as IDescription);
        result = `(?=${d}[^${d}]{0,}pattern)` + result;
      } else {
        result = "(?=[\\s\\S]{0,}pattern)" + result;
      }
    }
    if (data === "不包含 pattern") {
      const startNodeIndex = nodes.findIndex(
        (node) => node.data === "以 pattern 开头"
      );
      if (startNodeIndex !== -1) {
        const s = nodes[startNodeIndex + 1];
        const d = buildPattern(s.data as IDescription);
        result = `(?!${d}[^${d}]{0,}pattern)` + result;
      } else {
        result = "(?![\\s\\S]{0,}pattern)" + result;
      }
    }
    if (type === "p") {
      const d = buildPattern(data as IDescription);
      result = result.replace(/pattern/, d);
    }
    i += 1;
    node = nodes[i];
  }
  return result;
}

// 测试用例
// 6 到 12 位数字或字母，且必须包含数字和字母

const RegexpBuildPage = () => {
  const [num1, setNum1] = useValue<INum>({
    numPrefix: "范围",
  });
  const [num2, setNum2] = useValue<INum>({
    numPrefix: "范围",
  });
  const [chars, setChars] = useValue<IMatchedOption[]>([
    {
      id: MatchedType.Digit,
      text: "数字",
    },
  ]);
  const [patterns, setPatterns] = useState<IDescription[]>(
    (() => {
      return getDescription();
    })()
  );
  const [nodes, setNodes] = useState<INode[]>([]);
  const [regexp, setRegexp] = useState("");

  useEffect(() => {
    updateDescription(patterns);
  }, [patterns]);

  console.log("[PAGE]build - render", patterns, nodes);

  return (
    <div className="container m-auto">
      <h1 className="text-3xl font-bold">Regexp Build</h1>
      <div className="mt-6">
        <div className="flex items-center space-x-4">
          <p className="text-xl text-gray-800">构建 pattern</p>
          <button
            className="btn btn--primary"
            onClick={() => {
              const findEmptySpecialChars = chars.find(
                (c) => c.id === MatchedType.Special && !c.value
              );
              if (findEmptySpecialChars) {
                alert("存在未输入的指定字符");
                return;
              }
              if (!validateNum(num1)) {
                return;
              }
              setPatterns((prev) => {
                const { text: charText } = getTextAndChars({
                  chars,
                });
                const { text: numText, num } = getTextAndNumRange(num1);
                const description = {
                  text: numText + charText,
                  num,
                  chars,
                };
                if (prev.length === 0) {
                  return [description];
                }
                return prev.concat(description);
              });
            }}
          >
            添加
          </button>
        </div>
        <div className="flex items-center mt-2 space-x-2">
          <NumInput value={num1} onChange={setNum1} />
        </div>
        <div className="mt-2">
          <div className="flex items-center space-x-2">
            <MultipleCharInput value={chars} onChange={setChars} />
          </div>
        </div>
        <div className="mt-6 space-y-2">
          <p className="text-xl text-gray-800">可选 pattern</p>
          <div className="space-x-2 space-y-2">
            {patterns
              .filter((d) => !!d.text)
              .map((d, i) => {
                return (
                  <div key={i} className="inline-block">
                    <div
                      className="inline-flex items-center border border-1 border-gray-200 rounded"
                      onClick={() => {
                        const lastOne = nodes[nodes.length - 1];
                        if (lastOne && lastOne.type === "p") {
                          alert("不能连续选择匹配模式");
                          return;
                        }
                        // setRegexp((prev) => {
                        //   return prev + buildPattern(d);
                        // });
                        setNodes((prev) => {
                          return prev.concat({
                            type: "p",
                            data: d,
                          });
                        });
                      }}
                    >
                      <div className="py-1 px-2 bg-gray-100 cursor-pointer">
                        {d.text}
                      </div>
                      <div
                        className="px-2 text-gray-400 cursor-pointer hover:text-gray-800"
                        onClick={(event) => {
                          event.stopPropagation();
                          const nextDescription = patterns.filter(
                            (dd) => dd !== d
                          );
                          setPatterns(nextDescription);
                          updateDescription(nextDescription);
                        }}
                      >
                        x
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        <div className="mt-6">
          <p className="text-xl text-gray-800">语义</p>
          <div className="mt-2 space-y-2">
            <div className="flex space-x-2">
              <TextSelect
                options={[
                  {
                    value: "以 pattern 开头",
                    label: "以 pattern 开头",
                  },
                  {
                    value: "以 pattern 结尾",
                    label: "以 pattern 结尾",
                  },
                  {
                    value: "跟着 pattern",
                    label: "跟着 pattern",
                  },
                  // {
                  //   value: "并且",
                  //   label: "并且",
                  // },
                  // {
                  //   value: "或者",
                  //   label: "或者",
                  // },
                ]}
                onClick={(h1) => {
                  const lastNode = nodes[nodes.length - 1];
                  if (
                    lastNode?.data === "以 pattern 开头" &&
                    [
                      "以 pattern 开头",
                      "以 pattern 结尾",
                      "跟着 pattern",
                      "并且",
                      "或者",
                      "不包含 pattern",
                      "包含 pattern",
                    ].includes(h1)
                  ) {
                    alert("请选择模式");
                    return;
                  }
                  // if (lastNode?.data === h1) {
                  //   alert("不能连续选择相同的语义，请添加匹配模式或添加次数");
                  //   return;
                  // }
                  setNodes((prev) => {
                    return prev.concat({
                      type: "h",
                      data: h1,
                    });
                  });
                  if (h1 === "跟着 pattern") {
                  } else if (h1 === "或者") {
                  }
                }}
              ></TextSelect>
            </div>
            {/* <div className="flex space-x-2">
              <NumInput value={num2} onChange={setNum2} />
              <button
                className="btn"
                onClick={() => {
                  if (!validateNum(num2)) {
                    return;
                  }
                  setNodes((prev) => {
                    return prev.concat({
                      type: "c",
                      data: num2,
                    });
                  });
                }}
              >
                添加次数
              </button>
            </div> */}
            <div className="flex space-x-2">
              <TextSelect
                options={[
                  {
                    value: "不包含 pattern",
                    label: "不包含 pattern",
                  },
                  {
                    value: "包含 pattern",
                    label: "包含 pattern",
                  },
                ]}
                onClick={(h2) => {
                  const lastNode = nodes[nodes.length - 1];
                  if (
                    lastNode?.data === "以 pattern 开头" &&
                    [
                      "以 pattern 开头",
                      "以 pattern 结尾",
                      "跟着 pattern",
                      "并且",
                      "或者",
                      "不包含 pattern",
                      "包含 pattern",
                    ].includes(h2)
                  ) {
                    alert("请选择模式");
                    return;
                  }
                  setNodes((prev) => {
                    return prev.concat({
                      type: "c",
                      data: h2,
                    });
                  });
                }}
              ></TextSelect>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <div className="flex items-center space-x-4">
            <p className="text-xl text-gray-800">正则表达式</p>
            <button
              className="btn"
              onClick={() => {
                copy(regexp);
              }}
            >
              复制
            </button>
            <button
              className="btn"
              onClick={() => {
                setRegexp("");
                setNodes([]);
              }}
            >
              清空
            </button>
          </div>
          <div className="mt-2 text-2xl font-serif">{renderNodes(nodes)}</div>
          <div id="regexp" className="mt-2 text-2xl font-serif">
            {renderRegexp(nodes)}
          </div>
        </div>
      </div>
      {/* <div className="fixed right-12 bottom-12 px-6 py-4 bg-gray-100 rounded">
        <div className="space-y-2">
          <button className="block btn btn--primary w-24">回退</button>
          <button className="block btn btn--primary w-24">清空全部</button>
        </div>
      </div> */}
    </div>
  );
};

export default RegexpBuildPage;
