import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--bg-main)",
        foreground: "var(--text-primary)",
        border: "var(--border-main)",
        card: {
          DEFAULT: "var(--bg-card)",
          foreground: "var(--text-primary)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "#03140e",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          accent: "#00e599",
        },
        muted: {
          DEFAULT: "var(--bg-hover)",
          foreground: "var(--text-secondary)",
        },
        accent: {
          DEFAULT: "var(--primary)",
          foreground: "#03140e",
        },
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
