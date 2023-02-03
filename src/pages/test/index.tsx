import { useEffect, useRef } from "react";

import * as monaco from "monaco-editor";
import jsonWorker from "monaco-editor/esm/vs/language/json/json.worker?worker";
import editorWorker from "monaco-editor/esm/vs/editor/editor.worker?worker";

window.MonacoEnvironment = {
  // @ts-ignore
  getWorker(_: unknown, label: "json" | "javascript") {
    if (label === "json") {
      return new jsonWorker();
    }
    return new editorWorker();
  },
};

const TestPage = () => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current === null) {
      return;
    }
    const editor = monaco.editor.create(ref.current, {
      value: `{"name": "litao","number":1}`,
      language: "json",
      renderWhitespace: "all",
      minimap: {
        enabled: false,
      },
    });
    setTimeout(() => {
      editor.getAction("editor.action.formatDocument").run();
    }, 3000);
  }, []);
  return <div ref={ref} style={{ height: 480 }}></div>;
};

export default TestPage;
