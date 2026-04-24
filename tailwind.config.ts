import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#5E5CE6",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#9E9CF4",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#34C759",
          foreground: "#FFFFFF",
        },
        sidebar: {
          background: "#FFFFFF",
          foreground: "#1C1C1E",
          muted: "#8E8E93",
          active: "#F2F2F7",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
};
export default config;
