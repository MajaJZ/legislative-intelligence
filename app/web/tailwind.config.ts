import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5EF",
        ink: "#14181C",
        muted: "#5B6570",
        line: "#D6D2C8",
        accent: "#1E4A5A",
        warn: "#8A3B2E",
        positive: "#2F6B4F",
        panel: "#FFFFFF",
      },
      fontFamily: {
        serif: ["Source Serif 4 Variable", "Georgia", "serif"],
        sans: ["Inter Variable", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "2px",
        md: "2px",
        lg: "2px",
      },
      boxShadow: {
        none: "none",
      },
    },
  },
  plugins: [],
};

export default config;
