import React, { useRef, useState } from "react";

export function useValue(
  defaultValue: string | number | undefined,
  options: {
    onChange?: (v: any) => void;
  } = {}
): [value: string | number | undefined, binder: (v: any) => void] {
  const { onChange } = options;
  const [value, setValue] = useState<string | number | undefined>(defaultValue);

  const bindRef = useRef(function handleChange(event: React.ChangeEvent) {
    // console.log("[HOOK]useValue - handleChange", event);
    // @ts-ignore
    const v = event?.target?.value;
    if (v) {
      if (onChange) {
        onChange(v);
      }
      setValue(v);
      return;
    }
    // @ts-ignore
    setValue(event);
    if (onChange) {
      onChange(event);
    }
  });

  return [value, bindRef.current];
}
