import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import windiCSS from "vite-plugin-windicss";

import pkg from './package.json';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), windiCSS()],
  base: `https://static.funzm.com/tools/${pkg.version}/`,
  resolve: {
    alias: {
      "@list/core": path.resolve(__dirname, "./src/domains/list/core/src"),
      "@list/hook": path.resolve(__dirname, "./src/domains/list/hook/src"),
      "@": path.resolve(__dirname, "./src"),
      util: "tapable/lib/util-browser.js",
    },
  },
  build: {
    polyfillModulePreload: false,
  },
});
