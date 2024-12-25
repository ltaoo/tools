import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useMenus } from "@/hooks/menus";

const BasicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const ref = useRef<HTMLDivElement>(null);
  const links = useMenus();

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
