/**
 * @file 正则挑战页面
 */
import { useCallback, useState } from "react";
import cx from "classnames";

import { questions } from "./constants";

const QuestionCard: React.FC<{ input: string; expect: string[] }> = (props) => {
  const { input, expect } = props;
  const [regexp1, setRegexp1] = useState("");
  const [groups, setGroups] = useState([]);
  const [matches, setMatches] = useState("");
  const [error, setError] = useState(false);
  // const [correct, setCorrect] = useState(false);
  const execMatch = useCallback((content, regexp) => {
    setError(false);
    try {
      console.log("build regexp", regexp);
      const re1 = new RegExp(regexp, "g");
      const matches = content.match(re1);
      console.log(matches);
      if (matches?.length) {
        setMatches(JSON.stringify(matches));
      } else {
        setMatches("null");
      }
      if (regexp.match(/\(/)) {
        const re2 = new RegExp(regexp);
        const matchesAndGroups = content.match(re2);
        console.log(matchesAndGroups);
        if (matchesAndGroups?.length) {
          setGroups(matchesAndGroups.slice(1));
        } else {
          setGroups([]);
        }
      }
    } catch (err) {
      setError(true);
    }
  }, []);

  return (
    <div>
      <p className="text-xl">
        <span className="text-gray-500">input:</span> {input}
      </p>
      <div className="flex space-x-2 font-serif">
        {expect.map((e, i) => {
          return <p key={i}>{e}</p>;
        })}
      </div>
      <div className="regexp flex space-x-4">
        <textarea
          className={cx("flex-1 input", error ? "border-red-500" : "")}
          placeholder="请输入正则"
          value={regexp1}
          onChange={(event) => {
            const content = event.target.value;
            setRegexp1(content);
          }}
        />
        <button
          className="py-1 px-4 rounded bg-gray-800 text-white"
          onClick={() => {
            execMatch(input, regexp1);
          }}
        >
          测试
        </button>
      </div>
      <div className="space-x-6">
        <span>{matches}</span>
        <span>
          {(() => {
            if (!matches) {
              return null;
            }
            return matches === JSON.stringify(expect) ? "√" : "×";
          })()}
        </span>
      </div>
    </div>
  );
};

const RegexpChallengePage = () => {
  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">Regexp Challenge</h1>
      <div className="space-y-6">
        {questions.map((question, i) => {
          const { input, expect } = question;
          return <QuestionCard key={i} input={input} expect={expect} />;
        })}
      </div>
    </div>
  );
};

export default RegexpChallengePage;
