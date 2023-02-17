import { useEffect, useRef, useState } from "react";
import qs from "qs";
import copy from "copy-to-clipboard";
import message from "antd/es/message";
import "antd/es/message/style/index";

import { useValue } from "@/hooks";

const default_value =
  "https://ccp-bj29-video-preview.oss-enet.aliyuncs.com/lt/4A83485078C8F202915703D840D30C97251C76D5_420511000__sha1_bj29/SD/media.m3u8?di=bj29&dr=622310670&f=63db451b5d1a9c133396487eb61bbcd9becd0f84&security-token=CAIS%2BgF1q6Ft5B2yfSjIr5eGDuj1gppm4LbdQVb8lXEzWLdD2K7qrDz2IHFPeHJrBeAYt%2FoxmW1X5vwSlq5rR4QAXlDfNR27eVbZqVHPWZHInuDox55m4cTXNAr%2BIhr%2F29CoEIedZdjBe%2FCrRknZnytou9XTfimjWFrXWv%2Fgy%2BQQDLItUxK%2FcCBNCfpPOwJms7V6D3bKMuu3OROY6Qi5TmgQ41Uh1jgjtPzkkpfFtkGF1GeXkLFF%2B97DRbG%2FdNRpMZtFVNO44fd7bKKp0lQLukMWr%2Fwq3PIdp2ma447NWQlLnzyCMvvJ9OVDFyN0aKEnH7J%2Bq%2FzxhTPrMnpkSlacGoABj65Y5%2FGAWAC9ag7QcryQ5gkSCTt9N9Nps4GXoVM1u8Am4Bxzn9UTft7vXq07LpmwLYLSAX9meWl52D9ea4xACVZOXGfLXA0jR7i0bvOpylbNtvkCC7WcjGHpE0ZlUR17PtxThElElZsB%2FndIHjs9%2Fkmx0nfmpAttq0uyCrO7dr0%3D&u=5565045eef84445cbdece790aebe54bd&x-oss-access-key-id=STS.NT3ERAoEGWt6CpMqqfT8o7kAN&x-oss-expires=1676623373&x-oss-process=hls%2Fsign&x-oss-signature=RDb%2BM2eaaADLbVrA2xqVwcF2e0%2FpVaJIRvuu0SFGSOk%3D&x-oss-signature-version=OSS2";

const URLQueryParserPage = () => {
  const [url, setUrl] = useValue<string>(default_value);
  const [keyArr, setKeyArr] = useState<
    {
      key: string;
      value: string;
    }[]
  >([]);

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-3xl font-bold">URL search</h1>
      <div className="inputs">
        <div className="">
          <textarea
            className="w-full h-24 input"
            placeholder="请输入 url"
            value={url}
            onChange={setUrl}
          />
          <button
            className="py-1 px-4 rounded bg-gray-800 text-white"
            onClick={() => {
              if (!url) {
                return;
              }
              let search = decodeURIComponent(url);
              if (url.includes("?")) {
                search = url.split("?")[1];
              }
              const result = qs.parse(search, { ignoreQueryPrefix: false });
              const values = Object.keys(result).map((k) => {
                return {
                  key: k,
                  value: result[k] as string,
                };
              });
              setKeyArr(values);
            }}
          >
            解析
          </button>
        </div>
        <div className="mt-8 space-y-4">
          {keyArr.map(({ key, value }) => {
            return (
              <div key={key}>
                <div
                  className="text-xl"
                  onClick={() => {
                    copy(value);
                    message.success("复制成功");
                  }}
                >
                  {key}
                </div>
                <div
                  className="text-gray-500 break-all"
                  onClick={() => {
                    copy(value);
                    message.success("复制成功");
                  }}
                >
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default URLQueryParserPage;
