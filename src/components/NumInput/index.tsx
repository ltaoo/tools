import { useLatestValue, useValue, useVisible } from "@/hooks";
import { useEffect } from "react";

export interface INum {
  numPrefix: string;
  numStart?: string;
  numEnd?: string;
}
export function validateNum(num: INum) {
  if (num.numStart === "") {
    alert("请输入数字");
    return false;
  }
  if (num.numPrefix === "范围") {
    if (num.numEnd === "") {
      alert("请输入数字");
      return false;
    }
    if (Number(num.numEnd) < Number(num.numStart)) {
      alert("数字填写范围错误");
      return false;
    }
  }
  return true;
}
const NumInput: React.FC<{
  value?: INum;
  onChange?: (value: INum) => void;
}> = (props) => {
  const { value = {}, onChange } = props;

  const onChangeRef = useLatestValue(onChange);
  const valueRef = useLatestValue(value);
  const [numStartVisible, showNumStart, hideNumStart] = useVisible(true);
  const [rangeVisible, showRange, hideRange] = useVisible(true);
  const [numEndVisible, showNumEnd, hideNumEnd] = useVisible(true);
  const [numPrefix, setNumPrefix] = useValue("范围", {
    onChange: (prefix) => {
      console.log("prefix", prefix);
      // if (prefix === "无") {
      //   hideRange();
      //   hideNumStart();
      //   hideNumEnd();
      //   return;
      // }
      if (prefix !== "范围") {
        hideRange();
        hideNumEnd();
        return;
      }
      showRange();
      showNumEnd();
    },
  });
  const [numStart, setNumStart] = useValue("");
  const [numRange, setNumRange] = useValue("到");
  const [numEnd, setNumEnd] = useValue("");

  useEffect(() => {
    if (onChangeRef.current) {
      onChangeRef.current({
        ...valueRef.current,
        numPrefix,
        numStart,
        numEnd,
      });
    }
  }, [numPrefix, numStart, numEnd]);

  return (
    <div>
      <select className="input w-18" value={numPrefix} onChange={setNumPrefix}>
        <option>共</option>
        <option>范围</option>
        <option>至少</option>
        <option>最多</option>
        {/* <option>无</option> */}
      </select>
      {numStartVisible && (
        <input
          className="input"
          placeholder="请输入数量"
          value={numStart}
          onChange={setNumStart}
        />
      )}
      {rangeVisible && (
        <select className="input w-18" value={numRange} onChange={setNumRange}>
          <option>到</option>
        </select>
      )}
      {numEndVisible && (
        <input
          className="input"
          placeholder="请输入数量"
          value={numEnd}
          onChange={setNumEnd}
        />
      )}
    </div>
  );
};

export default NumInput;
