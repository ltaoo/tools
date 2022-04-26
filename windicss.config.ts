import { defineConfig } from "vite-plugin-windicss";
import plugin from "windicss/plugin";

export default defineConfig({
  extract: {
    include: ["**/*.{jsx,css,tsx}"],
    exclude: ["node_modules", ".git"],
  },
  //   attributify: true,
  shortcuts: {
    "primary-color": "bg-gray-800",
    // py-1 px-4 rounded bg-gray-800 text-white
    btn: "inline-block py-1 px-3 rounded border border-gray-100 bg-gray-100 text-gray-800 cursor-pointer",
    "btn--primary": "bg-gray-800 text-gray-100 hover:bg-gray-600",
    "btn--ghost":
      "border border-gray-100 text-gray-200 bg-none hover:border-gray-600 hover:text-gray-800",
    input:
      "py-2 px-2 border border-1 border-gray-200 rounded placeholder-gray-400",
    icon: "w-10 h-10 p-2 text-gray-500 rounded cursor-pointer hover:bg-gray-100 dark:text-gray-200 dark:hover:text-gray-800",
    "icon--small":
      "w-6 h-6 p-2 text-gray-500 rounded cursor-pointer hover:bg-gray-100",
    "icon--large":
      "w-12 h-12 p-2 text-gray-500 rounded cursor-pointer hover:bg-gray-100",
    center:
      "absolute top-[50%] left-[50%] transform -translate-x-2/4 -translate-y-2/4",
  },
  plugins: [
    require("windicss/plugin/line-clamp"),
    require("windicss/plugin/forms"),
    plugin(({ addUtilities }) => {
      const newUtilities = {
        ".decoration-wavy": {
          "-webkit-text-decoration-style": "wavy",
          "text-decoration-style": "wavy",
        },
      };
      addUtilities(newUtilities);
    }),
  ],
});
