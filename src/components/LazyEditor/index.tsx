/**
 * @file 使用 requirejs 加载包含最新版 typescript 的 monaco-editor 编辑器
 */
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import type * as monaco from "monaco-editor";

import { loadScript } from "@/utils/index";

interface IEditorProps {
  value?: string;
  defaultValue?: string;
  language?: string;
  onChange?: (value: string) => void;
  onSave?: (value?: string) => void;
  markers?: monaco.editor.IMarkerData[];
}
const LazyEditor = React.forwardRef((props: IEditorProps, ref) => {
  const {
    defaultValue,
    value,
    language = "typescript",
    onChange,
    onSave,
    markers,
  } = props;

  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const insRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<typeof monaco | null>(null);
  const [loading, setLoading] = useState(true);
  const languageRef = useRef(language);
  const vRef = useRef(value || defaultValue);

  useImperativeHandle(ref, () => ({
    getValue: () => insRef.current?.getValue(),
    setValue: (v: string) => {
      vRef.current = v;
      insRef.current?.setValue(v);
    },
  }));

  useEffect(() => {
    (async () => {
      if (insRef.current !== null) {
        return;
      }
      await loadScript(
        // "https://cdn.bootcdn.net/ajax/libs/require.js/2.3.6/require.js"
        "https://static.funzm.com/assets/libs/require.js/2.3.6/require.js",
      );
      // @ts-ignore
      if (window.requirejs === undefined) {
        return;
      }
      // console.log("[COMPONENT](LazyEditor)", editorRef.current);
      if (editorRef.current === null) {
        return;
      }
      // @ts-ignore
      requirejs.config({
        paths: {
          vs: "https://static.funzm.com/assets/monaco/4.9.4/min/vs",
        },
        ignoreDuplicateModules: ["vs/editor/editor.main"],
      });
      // console.log("before require modules", vRef.current, languageRef.current);
      // @ts-ignore
      requirejs(
        ["vs/editor/editor.main", "vs/language/typescript/tsWorker"],
        // @ts-ignore
        (monaco, ts) => {
          monacoRef.current = monaco;
          // console.log("loaded modules", monaco, ts, window.ts, vRef.current);
          const editor = monaco.editor.create(editorRef.current, {
            text: vRef.current,
            language: languageRef.current,
            scrollBeyondLastColumn: 3,
            scrollBeyondLastLine: true,
            fontSize: 14,
            quickSuggestions: {
              other: true,
              comments: true,
              strings: true,
            },
            minimap: {
              enabled: false,
            },
            acceptSuggestionOnCommitCharacter: true,
            acceptSuggestionOnEnter: "on",
            accessibilitySupport: "on",
            inlayHints: {
              enabled: true,
            },
            lightbulb: {
              enabled: true,
            },
          });
          editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
            const v = editor.getValue();
            if (onSaveRef.current) {
              onSaveRef.current(v);
            }
          });
          const model = editor.getModel();
          model?.onDidChangeContent(() => {
            if (onChangeRef.current) {
              onChangeRef.current(model.getValue());
            }
          });
          editor.setValue(vRef.current);
          insRef.current = editor;
          setLoading(false);
        },
        () => {
          alert("loaded modules failed");
        },
      );
    })();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handler, true);
    return () => {
      window.removeEventListener("keydown", handler, true);
    };
  }, []);

  useEffect(() => {
    const editor = insRef.current;
    if (editor === null) {
      return;
    }
    if (value && vRef.current !== value) {
      vRef.current = value;
      editor.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    vRef.current = value;
  }, [value]);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  useEffect(() => {
    if (onChange && onChange !== onChangeRef.current) {
      onChangeRef.current = onChange;
    }
  }, [onChange]);
  useEffect(() => {
    if (onSave && onSave !== onSaveRef.current) {
      onSaveRef.current = onSave;
    }
  }, [onSave]);

  useEffect(() => {
    if (!monacoRef.current || !insRef.current) {
      return;
    }
    const model = insRef.current.getModel();
    if (model) {
      monacoRef.current.editor.setModelMarkers(model, "owner", markers || []);
    }
  }, [markers, loading]);

  return (
    <div>
      {loading && <div>Loading</div>}
      <div ref={editorRef} className="h-120 border border-1" />
    </div>
  );
});

export default LazyEditor;
