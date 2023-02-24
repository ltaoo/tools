/**
 * @file 正则测试页面
 */
import { useCallback, useState } from "react";
import dayjs from "dayjs";
import { useValue } from "@/hooks";

const DayjsTestPage = () => {
  const [value, setValue] = useState("");
  const [result, setResult] = useState("");
  const [compareResult, setCompareResult] = useState<string[]>([]);

  const [date, setDate] = useValue("" + new Date());
  const [d1, setD1] = useValue("" + new Date());
  const [d2, setD2] = useValue("" + new Date());

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

  const compare = useCallback((d1, d2) => {
    const day1 = dayjs(d1);
    const day2 = dayjs(d2);

    const day1Local = dayjs(d1).format("YYYY-MM-DD HH:mm:ss");
    const day2Local = dayjs(d2).format("YYYY-MM-DD HH:mm:ss");

    const text = [
      `${day1Local} is after ${day2Local}? ${day1.isAfter(day2)}`,
      `${day1Local} is before ${day2Local}? ${day1.isBefore(day2)}`,
    ];

    setCompareResult(text);
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
        <h2 className="mt-8 text-xl font-bold">时间比较</h2>
        <div className="mt-2 flex space-x-2">
          <input
            className="input w-120"
            type="datetime"
            value={d1}
            onChange={setD1}
          />
          <input
            className="input w-120"
            type="datetime"
            value={d2}
            onChange={setD2}
          />
          <button
            className="btn btn--primary"
            onClick={() => {
              compare(d1, d2);
            }}
          >
            比较
          </button>
        </div>
        <div>
          {compareResult.map((t, i) => {
            return <div key={i}>{t}</div>;
          })}
        </div>
      </div>
    </div>
  );
};

export default DayjsTestPage;
