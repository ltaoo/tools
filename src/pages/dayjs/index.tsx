/**
 * @file 正则测试页面
 */
import { useCallback, useState } from "react";
import dayjs from "dayjs";
import { useValue } from "@/hooks";

const DayjsTestPage = () => {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<
    {
      time: string;
      tip: string;
    }[]
  >([]);
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
    if (timestamp.match(/Z$/)) {
      timestamp = new Date(timestamp).valueOf();
    }
    const res = dayjs(Number(timestamp)).format("YYYY-MM-DD HH:mm:ss");
    const text = [
      {
        time: dayjs(Number(timestamp)).toISOString(),
        tip: "格林尼治标准时间",
        tip1: "ISO 8601时间。T 是时分秒之间的分隔符，Z 表示 UTC 时区",
      },
      {
        time: res,
        tip: "北京时间",
        tip1: "北京时间比 UTC 快8小时，在原时间基础上加8小时即可。中国标准时间(CST)，实际上是 UTC+08:00",
      },
      {
        time: String(timestamp),
        tip: "时间戳",
        tip1: "指从格林尼治标准时间(UTC) 1970年1月1日0点0分0秒 开始计算的秒数",
      },
    ];
    setResult(text);
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
            解析
          </button>
        </div>
        <div className="mt-4">
          <div className="flex-1">
            <p className="">解析结果</p>
            <div className="matches min-h-24 mt-2 py-2 px-4 space-y-4 bg-gray-100 rounded">
              {result.map((r, i) => {
                const { tip, time } = r;
                return (
                  <div key={i}>
                    <div>{tip}</div>
                    <div>{time}</div>
                  </div>
                );
              })}
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
