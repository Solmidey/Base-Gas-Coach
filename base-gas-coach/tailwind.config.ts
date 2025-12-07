import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Inter",
          "Arial",
          "sans-serif"
        ],
      },
      colors: {
        baseBlue: "#0052FF",
        ink: "#0b1020",
      },
      boxShadow: {
        glass: "0 10px 30px rgba(0,0,0,0.25)",
      },
    },
  },
  plugins: [],
};

export default config;
