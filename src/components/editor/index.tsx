import React, { useEffect, useRef } from "react";

import * as monaco from "monaco-editor";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import cssWorker from "monaco-editor/esm/vs/language/css/css.worker?worker";
import htmlWorker from "monaco-editor/esm/vs/language/html/html.worker?worker";
import tsWorker from "monaco-editor/esm/vs/language/typescript/ts.worker?worker";
// @ts-ignore
import { initVimMode } from "monaco-vim";

function settings(key?: string, value?: any) {
  const settings = JSON.parse(localStorage.getItem("settings") || "{}");
  if (key !== undefined) {
    if (value !== undefined) {
      const nextSettings = {
        ...settings,
        [key]: value,
      };
      return localStorage.setItem("settings", JSON.stringify(nextSettings));
    }
    return settings[key];
  }
  return settings;
}

interface IEditorProps {
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onSave?: (value?: string) => void;
}
const Editor: React.FC<IEditorProps> = (props) => {
  const { defaultValue, value, onChange, onSave } = props;

  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const vimStatusRef = useRef<HTMLDivElement | null>(null);
  const insRef = useRef<monaco.editor.IStandaloneCodeEditor>();
  const vimModeRef = useRef(null);

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

  useEffect(() => {
    if (editorRef.current === null) {
      return;
    }
    if (insRef.current) {
      return;
    }
    // @ts-ignore
    window.MonacoEnvironment = {
      getWorker(
        _: unknown,
        label:
          | "json"
          | "css"
          | "scss"
          | "less"
          | "html"
          | "handlebars"
          | "razor"
          | "typescript"
          | "javascript"
      ) {
        if (label === "json") {
          return new jsonWorker();
        }
        if (label === "css" || label === "scss" || label === "less") {
          return new cssWorker();
        }
        if (label === "html" || label === "handlebars" || label === "razor") {
          return new htmlWorker();
        }
        if (label === "typescript" || label === "javascript") {
          return new tsWorker();
        }
        return new editorWorker();
      },
    };

    const editor = monaco.editor.create(editorRef.current, {
      value: defaultValue,
      language: "typescript",
      fontSize: 14,
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
      if (onSaveRef.current) {
        onSaveRef.current();
      }
    });
    const model = editor.getModel();
    //     console.log("[COMPONENT]Editor model", model);
    model?.onDidChangeContent(() => {
      //       console.log("[COMPONENT]Editor", model.getValue());
      if (onChangeRef.current) {
        onChangeRef.current(model.getValue());
      }
    });
    insRef.current = editor;
    if (settings("vim")) {
      const vimMode = initVimMode(editor, vimStatusRef.current);
      vimModeRef.current = vimMode;
    }
  }, []);

  //   useEffect(() => {
  //     if (insRef.current && defaultValue) {
  //       insRef.current.setValue(defaultValue);
  //     }
  //   }, [defaultValue]);

  return (
    <div>
      <div className="flex justify-between">
        <div>
          <div ref={vimStatusRef} />
        </div>
        <div className="flex items-center space-x-1">
          <input
            type="checkbox"
            onChange={(event) => {
              if (event.target.checked) {
                const vimMode = initVimMode(
                  insRef.current,
                  vimStatusRef.current
                );
                vimModeRef.current = vimMode;
                settings("vim", true);
                return;
              }
              settings("vim", false);
              if (vimModeRef.current) {
                // @ts-ignore
                vimModeRef.current.dispose();
              }
            }}
          />
          <span className="">vim</span>
        </div>
      </div>
      <div ref={editorRef} className="h-120 border border-1" />
    </div>
  );
};

export default Editor;
