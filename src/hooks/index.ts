import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from "react";

/**
 * 简化 input onChange 的写法
 */
export function useValue<T>(
  defaultValue: T,
  options: {
    onChange?: (v: T) => void;
  } = {}
): [value: T, binder: (v: any) => void, set: Dispatch<SetStateAction<T>>] {
  const { onChange } = options;
  const [value, setValue] = useState<T>(defaultValue);

  const bindRef = useRef(function handleChange(event: T) {
    // console.log("[HOOK]useValue - handleChange", event);
    // @ts-ignore
    const v = event?.target?.value;
    if (v !== undefined) {
      if (onChange) {
        onChange(v);
      }
      setValue(v);
      return;
    }
    // @ts-ignore
    setValue(event);
    if (onChange) {
      onChange(event as any as T);
    }
  });

  return [value, bindRef.current, setValue];
}

export function useVisible(
  defaultVisible: boolean
): [boolean, () => void, () => void, () => void, (visible: boolean) => void] {
  const [visible, setVisible] = useState(defaultVisible);

  const visibleRef = useRef(visible);
  const show = useRef(function showModal() {
    setVisible(true);
  });
  const hide = useRef(function showModal() {
    setVisible(false);
  });
  const toggle = useRef(function showModal() {
    if (visibleRef.current) {
      setVisible(false);
      return;
    }
    setVisible(true);
  });

  return [visible, show.current, hide.current, toggle.current, setVisible];
}

/**
 * 返回某个值的最新引用
 * @param value
 * @returns
 */
export function useLatestValue(value: any) {
  const ref = useRef(value);

  useEffect(() => {
    if (value !== ref.current) {
      ref.current = value;
    }
  }, [value]);

  return ref;
}
