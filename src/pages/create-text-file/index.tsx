/**
 * @file 创建文本文件
 */
import message from "antd/es/message";
import { saveAs } from "file-saver";
import "antd/es/message/style/index";

import { useValue } from "@/hooks";

const CreateTextFilePage = () => {
  const [filename, setFilename] = useValue<string>("");
  const [content, setContent] = useValue<string>("");

  function createFile() {
    if (!filename) {
      message.error("请输入文件名");
      return;
    }
    if (!content) {
      message.error("请输入文件内容");
      return;
    }
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, filename);
  }

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">New File</h1>
      <div className="inputs">
        <textarea
          className="w-full h-48 input"
          placeholder="请输入文件内容"
          value={content}
          rows={16}
          onChange={setContent}
        />
        <input
          className="w-full input mt-1"
          placeholder="请输入文件名（包含完整后缀）"
          value={filename}
          onChange={setFilename}
          onKeyDown={(event) => {
            if (event.code !== "Enter") {
              return;
            }
            event.preventDefault();
            createFile();
          }}
        />
      </div>
      <div className="mt-2 flex space-x-2">
        <button
          className="py-2 px-4 rounded bg-gray-800 text-white whitespace-nowrap"
          onClick={() => {
            createFile();
          }}
        >
          下载
        </button>
      </div>
    </div>
  );
};

export default CreateTextFilePage;
