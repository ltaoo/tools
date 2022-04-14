/**
 * @file 正则测试页面
 */
import { useCallback, useState } from "react";
import dayjs from "dayjs";
import { useValue } from "@/hooks";

const DayjsTestPage = () => {
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");

  const [date, setDate] = useValue("" + new Date());

  const format = useCallback((timestamp) => {
    if (!timestamp) {
      alert("请输入时间戳");
      return;
    }
    if (timestamp.length === 10) {
      timestamp = timestamp + "000";
    }
    const res = dayjs(Number(timestamp)).format("YYYY-MM-DD HH:mm:ss");
    setResult(res);
  }, []);

  return (
    <div className="container m-auto">
      <h1 className="text-3xl font-bold">Dayjs Test</h1>
      <div className="mt-6">
        <div className="flex space-x-2">
          <input
            className="w-120 input"
            placeholder="请输入时间戳"
            value={value}
            onChange={(event) => {
              const content = event.target.value;
              setValue(content);
            }}
          />
          <button
            className="btn btn--primary"
            onClick={() => {
              format(value);
            }}
          >
            格式化
          </button>
        </div>
        <div className="mt-4">
          <div className="flex-1">
            <p className="">格式化结果</p>
            <div className="matches min-h-24 mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded">
              {result}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8">
        <div className="flex space-x-2">
          <input
            className="input"
            type="date"
            value={date}
            onChange={setDate}
          />
        </div>
        <div className="mt-4">
          <div className="flex-1">
            <p className="">时间戳</p>
            <div className="matches min-h-24 mt-2 py-2 px-4 space-y-2 bg-gray-100 rounded">
              {typeof date === "number" || typeof date === "string"
                ? new Date(date).valueOf()
                : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayjsTestPage;
