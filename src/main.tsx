import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import BasicLayout from "@/layout/basic";
import HomePage from "@/pages/home";
import ProfilePage from "@/pages/profile";
import RegexpTestPage from "./pages/regexp";
import DayjsTestPage from "./pages/dayjs";
import ReplPage from "./pages/repl";

import "virtual:windi.css";
import "./global.css";

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BasicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/regexp" element={<RegexpTestPage />} />
          <Route path="/dayjs" element={<DayjsTestPage />} />
          <Route path="/repl" element={<ReplPage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
