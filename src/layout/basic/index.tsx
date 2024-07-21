import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

const links = [
  {
    name: "首页",
    to: "/",
  },
  {
    name: "正则测试",
    to: "/regexp",
  },
  {
    name: "正则构建",
    to: "/regexp-build",
  },
  {
    name: "正则挑战",
    to: "/regexp-challenge",
  },
  {
    name: "Dayjs 测试",
    to: "/dayjs",
  },
  // {
  //   name: "JavaScript 测试",
  //   to: "/repl",
  // },
  {
    name: "测试图片在线生成",
    to: "/img-create",
  },
  {
    name: "书源制作",
    to: "/book-source",
  },
  {
    name: "数据结构转换",
    to: "/struct-convert",
  },
  {
    name: "URL search 解析",
    to: "/url-search",
  },
  {
    name: "wifi 二维码",
    to: "/wifi",
  },
];

const BasicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);

  // console.log(location);
  useEffect(() => {
    // document.addEventListener("copy", (event) => {
    // const clipboardData = event.clipboardData;
    // if (!clipboardData) {
    //   return;
    // }
    // let text = window.getSelection().toString();
    // console.log('before set data', text);
    // text = "***微拍堂敏感信息禁止复制***";
    // event.preventDefault();
    // clipboardData.setData("text/plain", `${text}`);
    // });
    // if (ref.current) {
    //   ref.current.addEventListener("copy", (event) => {
    //     event.stopPropagation();
    //   });
    // }
  }, []);

  return (
    <div className="flex flex-col h-full p-8 overflow-hidden">
      <div className="relative flex justify-between h-full">
        <div className="h-full py-4 px-6 bg-gray-100 space-y-4">
          {links.map((link) => {
            const { name, to } = link;
            return (
              <Link
                key={to}
                className="block py-2 px-4 text-gray-800 rounded cursor-pointer no-underline"
                to={to}
              >
                {name}
              </Link>
            );
          })}
        </div>
        <div className="flex-1 w-full ml-8 overflow-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default BasicLayout;
