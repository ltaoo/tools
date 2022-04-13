import path from "path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import windiCSS from "vite-plugin-windicss";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), windiCSS()],
  resolve: {
    alias: {
      "@list/core": path.resolve(__dirname, "./src/domains/list/core/src"),
      "@list/hook": path.resolve(__dirname, "./src/domains/list/hook/src"),
      "@": path.resolve(__dirname, "./src"),
      util: "tapable/lib/util-browser.js",
    },
  },
});
