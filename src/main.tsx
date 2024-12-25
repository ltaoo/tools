import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Routes, Route } from "react-router-dom";

import BasicLayout from "@/layout/basic";

import { useMenus } from "./hooks/menus";

import "virtual:windi.css";
import "./global.css";

const loading = <div>Loading</div>;

function Application() {
  const links = useMenus();

  return (
    <React.StrictMode>
      <HashRouter>
        <Routes>
          <Route path="/" element={<BasicLayout />}>
            {links.map((link) => {
              if (link.render) {
                return (
                  <Route
                    key={link.to}
                    path={link.to}
                    element={React.createElement(link.page)}
                  />
                );
              }
              return (
                <Route
                  key={link.to}
                  path={link.to}
                  element={
                    <React.Suspense fallback={loading}>
                      {React.createElement(link.page)}
                    </React.Suspense>
                  }
                />
              );
            })}
          </Route>
        </Routes>
      </HashRouter>
    </React.StrictMode>
  );
}

ReactDOM.render(<Application />, document.getElementById("root"));
