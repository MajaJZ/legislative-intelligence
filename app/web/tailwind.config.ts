import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: "#0F172A",
        slate: "#475569",
        accent: "#0EA5E9", /* Sharp, professional blue */
        panel: "#FFFFFF",
        border: "#E2E8F0",
      },
      borderRadius: {
        DEFAULT: "2px", /* Sharp corners, no pills */
        sm: "2px",
        md: "2px",
      },
    },
  },
  plugins: [],
};
export default config;
