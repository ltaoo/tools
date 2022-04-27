import { useState } from "react";

import { useLatestValue, useValue, useVisible } from "@/hooks";

export interface IMatchedOption {
  id: number;
  text: string;
  value?: string;
  or?: string;
  not?: boolean;
}
export enum MatchedType {
  Digit,
  Letter,
  LowerCase,
  UpperCase,
  Mark,
  Word,
  NotWord,
  Space,
  NotSpace,
  Special,
  Any,
  Chinese,
}
const enabledChars = [
  {
    id: MatchedType.Digit,
    text: "数字",
  },
  {
    id: MatchedType.Letter,
    text: "字母",
  },
  {
    id: MatchedType.UpperCase,
    text: "大写字母",
  },
  {
    id: MatchedType.LowerCase,
    text: "小写字母",
  },
  {
    id: MatchedType.Chinese,
    text: "中文",
  },
  {
    id: MatchedType.Mark,
    text: "符号",
  },
  {
    id: MatchedType.Space,
    text: "空白",
  },
  {
    id: MatchedType.Special,
    text: "指定字符",
  },
  {
    id: MatchedType.Any,
    text: "任意字符",
  },
];
const MatchedInput: React.FC<{
  value?: IMatchedOption;
  onChange?: (value?: IMatchedOption) => void;
}> = (props) => {
  const { value, onChange } = props;

  const onChangeRef = useLatestValue(onChange);
  const [visible, show, hide] = useVisible(false);
  const [char, setChar] = useValue<string>(value?.text || "2", {
    onChange: (v) => {
      if (onChange) {
        const matched = enabledChars.find((c) => c.text === v);
        onChange(matched);
      }
      if (v === "指定字符") {
        show();
        return;
      }
      hide();
    },
  });
  const [specialChar, setSpecialChar] = useValue("", {
    onChange: (v) => {
      if (onChangeRef.current) {
        onChangeRef.current({
          id: MatchedType.Special,
          text: "指定字符",
          value: v,
        });
      }
    },
  });

  return (
    <div>
      <select className="input w-28" value={char} onChange={setChar}>
        {enabledChars.map((char, i) => {
          const { id, text } = char;
          return (
            <option key={i} value={text}>
              {text}
            </option>
          );
        })}
      </select>
      {visible && (
        <input
          className="input w-12"
          value={specialChar}
          onChange={setSpecialChar}
        />
      )}
    </div>
  );
};
const MultipleCharInput: React.FC<{
  value: {
    id: number;
    text: string;
    value?: string;
    or?: string;
    not?: boolean;
  }[];
  onChange?: (values: unknown[]) => void;
}> = (props) => {
  const { value: values = [], onChange } = props;

  const onChangeRef = useLatestValue(onChange);
  const valueRef = useLatestValue(values);
  //   const [values, setValues] = useState([]);

  console.log("[COMPONENT]MultipleCharInput - render", values);

  return (
    <div className="flex items-center space-x-2">
      <select
        className="input w-18 text-gray-500"
        onChange={(event) => {
          const v = event.target.value;
          if (onChangeRef) {
            if (v === "非") {
              valueRef.current[0].not = true;
            } else {
              valueRef.current[0].not = false;
            }
            onChangeRef.current([...valueRef.current]);
          }
        }}
      >
        <option></option>
        <option>非</option>
      </select>
      {values.map((char, index) => {
        const { id, text, value, or } = char;
        return (
          <div key={index} className="flex items-center space-x-2">
            <MatchedInput
              value={char}
              onChange={(nextChar) => {
                if (onChangeRef.current) {
                  onChangeRef.current([
                    ...valueRef.current.slice(0, index),
                    {
                      ...char,
                      ...nextChar,
                    },
                    ...valueRef.current.slice(index + 1),
                  ]);
                }
              }}
            />
            <select
              className="input w-18 text-gray-500"
              value={or}
              onChange={(event) => {
                const v = event.target.value;
                if (v === "或") {
                  if (onChangeRef.current) {
                    onChangeRef.current([
                      ...valueRef.current.slice(0, index),
                      {
                        ...char,
                        or: "或",
                      },
                      ...valueRef.current.slice(index + 1),
                      {
                        id: MatchedType.Digit,
                        text: "数字",
                      },
                    ]);
                  }
                  return;
                }
                if (onChangeRef) {
                  onChangeRef.current([
                    ...valueRef.current.slice(0, index),
                    {
                      id,
                      text,
                      value,
                    },
                  ]);
                }
              }}
            >
              <option></option>
              <option>或</option>
            </select>
          </div>
        );
      })}
    </div>
  );
};

export default MultipleCharInput;
