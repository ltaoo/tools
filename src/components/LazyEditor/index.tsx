/**
 * @file 使用 requirejs 加载包含最新版 typescript 的 monaco-editor 编辑器
 */
import React, { useEffect, useRef, useState } from "react";
import type * as monaco from "monaco-editor";
import { loadScript } from "@/utils";

interface IEditorProps {
  value?: string;
  defaultValue?: string;
  language?: string;
  onChange?: (value: string) => void;
  onSave?: (value?: string) => void;
}
const LazyEditor: React.FC<IEditorProps> = (props) => {
  const {
    defaultValue,
    value,
    language = "typescript",
    onChange,
    onSave,
  } = props;

  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const insRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const [loading, setLoading] = useState(true);
  const languageRef = useRef(language);
  const vRef = useRef(value || defaultValue);

  useEffect(() => {
    (async () => {
      if (insRef.current !== null) {
        return;
      }
      await loadScript(
        "https://cdn.bootcdn.net/ajax/libs/require.js/2.3.6/require.js"
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
          vs: "https://typescript.azureedge.net/cdn/4.9.4/monaco/min/vs",
        },
        ignoreDuplicateModules: ["vs/editor/editor.main"],
      });
      // console.log("before require modules", vRef.current, languageRef.current);
      // @ts-ignore
      requirejs(
        ["vs/editor/editor.main", "vs/language/typescript/tsWorker"],
        // @ts-ignore
        (monaco, ts) => {
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
          // editor.addCommand(
          //   monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS,
          //   function () {}
          // );
          const model = editor.getModel();
          // console.log("[COMPONENT]Editor model", model);
          model?.onDidChangeContent(() => {
            //       console.log("[COMPONENT]Editor", model.getValue());
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
        }
      );
    })();
  }, []);

  useEffect(() => {
    const editor = insRef.current;
    if (editor === null) {
      return;
    }
    if (value && vRef.current !== value) {
      vRef.current = value;
      // editor.setValue(value);
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
      onChangeRef.current === onChange;
    }
  }, [onChange]);
  useEffect(() => {
    if (onSave && onSave !== onSaveRef.current) {
      onSaveRef.current === onSave;
    }
  }, [onSave]);

  return (
    <div>
      {loading && <div>Loading</div>}
      <div ref={editorRef} className="h-120 border border-1" />
    </div>
  );
};

export default LazyEditor;
