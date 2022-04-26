import { IMatchedOption, MatchedType } from "@/components/CharInput";
import { INum } from "@/components/NumInput";

export function getTextAndNumRange({ numPrefix, numStart, numEnd }: INum): {
  text: string;
  num: number[];
} {
  let text = ";";
  let num: number[] = [];
  if (numPrefix === "范围") {
    text = numStart + "到" + numEnd + "个";
    num = [Number(numStart), Number(numEnd)];
  } else if (numPrefix === "共") {
    text = numStart + "个";
    num = [Number(numStart)];
  } else if (numPrefix === "至少") {
    text = "" + numPrefix + numStart + "个";
    // @ts-ignore
    num = [Number(numStart), null];
  } else if (numPrefix === "最多") {
    text = "" + numPrefix + numStart + "个";
    num = [0, Number(numStart)];
  }
  return {
    text,
    num,
  };
}
export function getTextAndChars({ chars }: { chars: IMatchedOption[] }) {
  const text = chars
    .map((char) => {
      const { id, text, value } = char;
      if (id === MatchedType.Special) {
        return value;
      }
      return text;
    })
    .join("或");
  return {
    text: chars[0].not ? `非${text}` : text,
    chars,
  };
}
export interface IDescription {
  text: string;
  num: number[];
  chars: IMatchedOption[];
}
/**
 * 根据描述构建匹配模式
 * @param description
 * @returns
 */
export function buildPattern(description: IDescription) {
  const { num, chars } = description;
  //   let result = chars.length === 1 ? "" : "[";
  let result = "[";
  // @ts-ignore
  if (chars[0].not) {
    result += "^";
  }
  for (let i = 0; i < chars.length; i += 1) {
    const { id, value } = chars[i];
    if (id === MatchedType.Digit) {
      result += "0-9";
    } else if (id === MatchedType.Letter) {
      result += "a-zA-Z";
    } else if (id === MatchedType.UpperCase) {
      result += "A-Z";
    } else if (id === MatchedType.LowerCase) {
      result += "a-z";
    } else if (id === MatchedType.Mark) {
      result += "\\.\\*\\+\\+\\?\\(\\)\\[\\]\\{\\}_-/=!@#\\$%\\^&<>:;'\"~`";
    } else if (id === MatchedType.Space) {
      result += "\\t \\v\\n\\r\\f";
    } else if (id === MatchedType.Special) {
      result += (() => {
        if (value) {
          return value
            .replace(".", "\\.")
            .replace("*", "\\*")
            .replace("+", "\\+")
            .replace("?", "\\?")
            .replace("(", "\\(")
            .replace(")", "\\)")
            .replace("{", "\\{")
            .replace("}", "\\}")
            .replace("[", "\\[")
            .replace("]", "\\]");
        }
        return "";
      })();
    } else if (id === MatchedType.Any) {
      result += ".";
    } else if (id === MatchedType.Chinese) {
      result += "\\u4e00-\\u9fa5";
    }
  }
  //   result += chars.length === 1 ? "" : "]";
  result += "]";
  if (num.length === 0) {
    return result;
  }
  if (num.length === 1) {
    result += `{${num[0]}}`;
  } else {
    if (num[1] === null) {
      result += `{${num[0]},}`;
    } else {
      result += `{${num[0]},${num[1]}}`;
    }
  }
  return result;
}

export function getDescription(): IDescription[] {
  return JSON.parse(localStorage.getItem("description") || "[]");
}
export function updateDescription(nextMemories: IDescription[]) {
  return localStorage.setItem("description", JSON.stringify(nextMemories));
}
