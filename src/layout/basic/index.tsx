import React, { useEffect, useRef, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import cn from "classnames";

import { useMenus } from "@/hooks/menus";

const BasicLayout = () => {
  const location = useLocation();
  const links = useMenus();

  return (
    <div className="flex flex-col w-screen h-screen overflow-hidden">
      <div className="relative flex justify-between w-full h-full">
        <div className="w-[228px] h-full p-4 bg-gray-100 space-y-1">
          {links.map((link) => {
            const { name, to } = link;
            return (
              <Link
                key={to}
                className={cn(
                  "block py-2 px-4 text-gray-800 rounded cursor-pointer no-underline",
                  {
                    "hover:bg-gray-200": to !== location.pathname,
                    "bg-gray-300": to === location.pathname,
                  },
                )}
                to={to}
              >
                {name}
              </Link>
            );
          })}
        </div>
        <div className="flex-1 w-0 h-full overflow-y-auto">
          <div className="p-4">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicLayout;
