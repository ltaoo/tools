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
const ImageCreatePage = React.lazy(() => import("@/pages/create-img"));
const StructConverterPage = React.lazy(() => import("@/pages/struct"));
const URLSearchParsePage = React.lazy(() => import("@/pages/query"));
const TestPage = React.lazy(() => import("@/pages/test"));

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
            path="/img-create"
            element={
              <React.Suspense fallback={loading}>
                <ImageCreatePage />
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
          <Route
            path="/struct-convert"
            element={
              <React.Suspense fallback={loading}>
                <StructConverterPage />
              </React.Suspense>
            }
          />
          <Route
            path="/url-search"
            element={
              <React.Suspense fallback={loading}>
                <URLSearchParsePage />
              </React.Suspense>
            }
          />
          <Route
            path="/test"
            element={
              <React.Suspense fallback={loading}>
                <TestPage />
              </React.Suspense>
            }
          />
        </Route>
      </Routes>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById("root")
);
