import React from "react";

import HomePage from "@/pages/home";

// const ReplPage = React.lazy(() => import("@/pages/repl"));
const DayjsTestPage = React.lazy(() => import("@/pages/dayjs"));
const RegexpTestPage = React.lazy(() => import("@/pages/regexp"));
const RegexpChallengePage = React.lazy(
  () => import("@/pages/regexp-challenge"),
);
const RegexpBuildPage = React.lazy(() => import("@/pages/regexp-build"));
const ImageCreatePage = React.lazy(() => import("@/pages/create-img"));
const TextFileCreatePage = React.lazy(() => import("@/pages/create-text-file"));
// const BookSourceBuildPage = React.lazy(() => import("@/pages/book-source"));
const StructConverterPage = React.lazy(() => import("@/pages/struct"));
const URLSearchParsePage = React.lazy(() => import("@/pages/query"));
const CookieParsePage = React.lazy(() => import("@/pages/cookie"));
const WifiQRCodePage = React.lazy(() => import("@/pages/wifi"));
const Base64ParsePage = React.lazy(() => import("@/pages/base64"));
const TextIndexesPage = React.lazy(() => import("@/pages/text-indexes"));
const CurlParsePage = React.lazy(() => import("@/pages/curl"));
const WechatXMLParserPage = React.lazy(() => import("@/pages/wechat_xml"));
const WhistleMockPage = React.lazy(() => import("@/pages/whistle_mock"));

export function useMenus() {
  return [
    {
      name: "首页",
      to: "/",
      hidden: true,
      render: true,
      page: HomePage,
    },
    {
      name: "正则测试",
      to: "/regexp",
      page: RegexpTestPage,
    },
    {
      name: "正则构建",
      to: "/regexp-build",
      page: RegexpBuildPage,
    },
    {
      name: "正则挑战",
      to: "/regexp-challenge",
      page: RegexpChallengePage,
    },
    {
      name: "Dayjs 测试",
      to: "/dayjs",
      page: DayjsTestPage,
    },
    {
      name: "测试图片生成",
      to: "/img-create",
      page: ImageCreatePage,
    },
    {
      name: "文本文件生成",
      to: "/file-create",
      page: TextFileCreatePage,
    },
    // {
    //   name: "书源制作",
    //   to: "/book-source",
    //   page: BookSourceBuildPage,
    // },
    {
      name: "数据结构转换",
      to: "/struct-convert",
      page: StructConverterPage,
    },
    {
      name: "Base64 解析",
      to: "/base64",
      page: Base64ParsePage,
    },
    {
      name: "URL search 解析",
      to: "/url-search",
      page: URLSearchParsePage,
    },
    {
      name: "Cookie 解析",
      to: "/cookie",
      page: CookieParsePage,
    },
    {
      name: "Curl 解析",
      to: "/curl-parse",
      page: CurlParsePage,
    },
    {
      name: "WechatXML 解析",
      to: "/wechat-xml",
      page: WechatXMLParserPage,
    },
    {
      name: "Whistle Mock",
      to: "/whistle-mock",
      page: WhistleMockPage,
    },
    {
      name: "wifi 二维码",
      to: "/wifi",
      page: WifiQRCodePage,
    },
    {
      name: "文本下标",
      to: "/text-indexes",
      page: TextIndexesPage,
    },
  ];
}
