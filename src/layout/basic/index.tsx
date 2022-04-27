import { useState } from "react";
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
  {
    name: "JavaScript 测试",
    to: "/repl",
  },
];

const BasicLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // console.log(location);

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
