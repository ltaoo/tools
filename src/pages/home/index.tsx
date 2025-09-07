/**
 * @file 工具首页
 */
import { useMenus } from "@/hooks/menus";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const HomePage = () => {
  const navigate = useNavigate();
  const links = useMenus();

  return (
    <div className="container m-auto space-y-6">
      <h1 className="text-5xl font-bold">My Tools</h1>
      <div className="grid grid-cols-6 gap-2">
        {links.map((link) => {
          if (link.hidden) {
            return null;
          }
          return (
            <div key={link.name} className="p-4 border rounded-md cursor-pointer">
              <Link
                key={link.to}
                className="block py-2 px-4 text-gray-800 rounded cursor-pointer no-underline"
                to={link.to}
              >
                {link.name}
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default HomePage;
