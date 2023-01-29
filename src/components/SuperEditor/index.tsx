/**
 * @file 编辑器
 */
import React, { useCallback, useEffect, useRef, useState } from "react";
import type * as monaco from "monaco-editor";

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

async function loadModulesWithProgress<T extends Record<string, unknown>>(
  modules: {
    name: string;
    mod: Promise<unknown>;
    getValue?: (mod: unknown) => unknown;
  }[],
  options: Partial<{
    onProgress: (progress: number) => void;
    onSuccess: (mod: T) => void;
  }> = {}
) {
  return new Promise((resolve) => {
    const { onProgress, onSuccess } = options;
    let count = 0;
    // @ts-ignore
    const result: T = {};
    for (let i = 0; i < modules.length; i += 1) {
      const {
        name,
        mod,
        getValue = (v) => {
          // @ts-ignore
          const d = v.default;
          if (d) {
            return d;
          }
          return v;
        },
      } = modules[i];
      mod.then((m) => {
        count += 1;
        // console.log("load module success", m, getValue(m));
        if (onProgress) {
          onProgress(Math.floor((count / modules.length) * 100));
        }
        // @ts-ignore
        result[name] = getValue(m);
        if (count === modules.length) {
          if (onSuccess) {
            onSuccess(result as T);
            resolve(result);
          }
        }
      });
    }
  });
}

type Mods = {
  monaco: typeof monaco;
  jsonWorker: new () => void;
  tsWorker: new () => void;
  editorWorker: new () => void;
  initVimMode: (
    editor: monaco.editor.IStandaloneCodeEditor,
    dom: HTMLElement | null
  ) => void;
};

interface IEditorProps {
  value?: string;
  defaultValue?: string;
  language?: string;
  onChange?: (value: string) => void;
  onSave?: (value?: string) => void;
}
const Editor: React.FC<IEditorProps> = (props) => {
  const { defaultValue, value, language = "json", onChange, onSave } = props;

  const onChangeRef = useRef(onChange);
  const onSaveRef = useRef(onSave);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const vimStatusRef = useRef<HTMLDivElement | null>(null);
  const insRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const vimModeRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const modsRef = useRef<Mods | null>(null);
  const languageRef = useRef(language);
  const vRef = useRef(value);

  useEffect(() => {
    const editorIns = insRef.current;
    if (editorIns === null) {
      return;
    }
    if (value && vRef.current !== value) {
      vRef.current = value;
      editorIns.setValue(value);
    }
  }, [value]);

  useEffect(() => {
    vRef.current = value;
  }, [value]);
  useEffect(() => {
    languageRef.current = language;
  }, [language]);

  const initializeEditor = useCallback(() => {
    // console.log(
    //   "[COMPONENT](SuperEditor) - initializeEditor",
    //   editorRef.current,
    //   insRef.current,
    //   modsRef.current
    // );
    if (editorRef.current === null) {
      return;
    }
    if (insRef.current) {
      return;
    }
    if (modsRef.current === null) {
      return;
    }
    const { monaco, jsonWorker, tsWorker, editorWorker, initVimMode } =
      modsRef.current;

    console.log("[](SuperEditor) - initialize editor", monaco);

    // @ts-ignore
    window.MonacoEnvironment = {
      // @ts-ignore
      getWorker(_: unknown, label: "json" | "typescript" | "javascript") {
        if (label === "json") {
          return new jsonWorker();
        }
        if (label === "typescript" || label === "javascript") {
          return new tsWorker();
        }
        return new editorWorker();
      },
    };
    monaco.languages.register({
      id: "json5",
    });
    monaco.languages.setMonarchTokensProvider("json5", {
      keywords: [],
      typeKeywords: [],
      operators: [],
      digits: /\d+(_+\d+)*/,
      hexdigits: /[[0-9a-fA-F]+(_+[0-9a-fA-F]+)*/,
      tokenizer: {
        root: [
          [
            /[a-z_$][\w$]*/,
            {
              cases: {
                "@typeKeywords": "keyword",
                "@keywords": "keyword",
                "@default": "identifier",
              },
            },
          ],
          [/[A-Z][\w\$]*/, "type.identifier"], // to show class names nicely
          // whitespace
          { include: "@whitespace" },
          // delimiters and operators
          [/[{}()\[\]]/, "@brackets"],
          // @ annotations.
          // As an example, we emit a debugging log message on these tokens.
          // Note: message are supressed during the first load -- change some lines to see them.
          // eslint-disable-next-line no-useless-escape
          [
            /@\s*[a-zA-Z_\$][\w\$]*/,
            { token: "annotation", log: "annotation token: $0" },
          ],
          // numbers
          [/\d*\.\d+([eE][\-+]?\d+)?/, "number.float"],
          [/0[xX][0-9a-fA-F]+/, "number.hex"],
          [/\d+/, "number"],
          // delimiter: after number because of .\d floats
          [/[;,.]/, "delimiter"],
          // strings
          [/"([^"\\]|\\.)*$/, "string.invalid"],
          // non-teminated string
          [/"/, { token: "string.quote", bracket: "@open", next: "@string" }],
          // character/*  */s
          [/'[^\\']'/, "string"],
          [/'/, "string.invalid"],
        ],
        string: [
          [/[^\\"]+/, "string"],
          [/\\./, "string.escape.invalid"],
          [/"/, { token: "string.quote", bracket: "@close", next: "@pop" }],
        ],
        comment: [
          [/[^\/*]+/, "comment"],
          [/\/\*/, "comment", "@push"],
          // nested comment
          ["\\*/", "comment", "@pop"],
          [/[\/*]/, "comment"],
        ],
        whitespace: [
          [/[ \t\r\n]+/, "white"],
          [/\/\*/, "comment", "@comment"],
          [/\/\/.*$/, "comment"],
        ],
      },
    } as monaco.languages.IMonarchLanguage);
    // console.log("[COMPONENT](SuperEditor) before create editor", defaultValue);
    const editor = monaco.editor.create(editorRef.current, {
      value: defaultValue,
      language: languageRef.current,
      scrollBeyondLastLine: false,
      renderWhitespace: "all",
      fontSize: 14,
      minimap: {
        enabled: false,
      },
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, function () {
      if (onSaveRef.current) {
        onSaveRef.current();
      }
    });
    const model = editor.getModel();
    // console.log("[COMPONENT]Editor model", model);
    model?.onDidChangeContent(() => {
      //       console.log("[COMPONENT]Editor", model.getValue());
      if (onChangeRef.current) {
        onChangeRef.current(model.getValue());
      }
    });
    insRef.current = editor;
    if (settings("vim")) {
      const vimMode = initVimMode(editor, vimStatusRef.current);
      // @ts-ignore
      vimModeRef.current = vimMode;
    }
  }, []);

  useEffect(() => {
    loadModulesWithProgress<Mods>(
      [
        { name: "monaco", mod: import("monaco-editor") },
        {
          name: "editorWorker",
          mod: import("monaco-editor/esm/vs/editor/editor.worker?worker"),
        },
        {
          name: "jsonWorker",
          mod: import("monaco-editor/esm/vs/language/json/json.worker?worker"),
        },
        {
          name: "tsWorker",
          mod: import(
            "monaco-editor/esm/vs/language/typescript/ts.worker?worker"
          ),
        },
        {
          name: "initVimMode",
          // @ts-ignore
          mod: import("monaco-vim"),
          getValue: (d) => {
            // @ts-ignore
            return d.initVimMode;
          },
        },
      ],
      {
        onProgress: (progress) => {
          // console.log(
          //   "[COMPONENT](SuperEditor) - module load progress",
          //   progress
          // );
        },
        onSuccess: async (moduleMap) => {
          // console.log("[COMPONENT](SuperEditor) - all module loaded");
          setLoading(false);
          modsRef.current = moduleMap;
          initializeEditor();
        },
      }
    );
  }, []);

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

  // useEffect(() => {}, []);

  if (loading) {
    return <div>Loading</div>;
  }

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
              // if (event.target.checked) {
              //   const vimMode = initVimMode(
              //     insRef.current,
              //     vimStatusRef.current
              //   );
              //   vimModeRef.current = vimMode;
              //   settings("vim", true);
              //   return;
              // }
              // settings("vim", false);
              // if (vimModeRef.current) {
              //   // @ts-ignore
              //   vimModeRef.current.dispose();
              // }
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
