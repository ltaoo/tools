import React from "react";
import ReactDOM from "react-dom";
import { HashRouter, Routes, Route } from "react-router-dom";

import BasicLayout from "@/layout/basic";

import HomePage from "@/pages/home";

import "virtual:windi.css";
import "./global.css";

const ProfilePage = React.lazy(() => import("@/pages/profile"));
const DayjsTestPage = React.lazy(() => import("@/pages/dayjs"));
const ReplPage = React.lazy(() => import("@/pages/repl"));
const RegexpTestPage = React.lazy(() => import("@/pages/regexp"));
const RegexpChallengePage = React.lazy(
  () => import("@/pages/regexp-challenge")
);
const RegexpBuildPage = React.lazy(() => import("@/pages/regexp-build"));
const BookSourceBuildPage = React.lazy(() => import("@/pages/book-source"));

const loading = <div>Loading</div>;

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<BasicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/regexp"
            element={
              <React.Suspense fallback={loading}>
                <RegexpTestPage />
              </React.Suspense>
            }
          />
          <Route
            path="/regexp-challenge"
            element={
              <React.Suspense fallback={loading}>
                <RegexpChallengePage />
              </React.Suspense>
            }
          />
          <Route
            path="/regexp-build"
            element={
              <React.Suspense fallback={loading}>
                <RegexpBuildPage />
              </React.Suspense>
            }
          />
          <Route
            path="/dayjs"
            element={
              <React.Suspense fallback={loading}>
                <DayjsTestPage />
              </React.Suspense>
            }
          />
          <Route
            path="/repl"
            element={
              <React.Suspense fallback={loading}>
                <ReplPage />
              </React.Suspense>
            }
          />
          <Route
            path="/book-source"
            element={
              <React.Suspense fallback={loading}>
                <BookSourceBuildPage />
              </React.Suspense>
            }
          />
          <Route
            path="/profile/:id"
            element={
              <React.Suspense fallback={loading}>
                <ProfilePage />
              </React.Suspense>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
