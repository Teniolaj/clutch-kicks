import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Clutch Kicks design-schema tokens (CSS vars, themeable)
        bg: "var(--ck-bg)",
        "bg-alt": "var(--ck-bg-alt)",
        "bg-sunken": "var(--ck-bg-sunken)",
        "bg-invert": "var(--ck-bg-invert)",

        ink: "var(--ck-ink)",
        "ink-muted": "var(--ck-ink-muted)",
        "ink-invert": "var(--ck-ink-invert)",

        line: "var(--ck-line)",
        "line-strong": "var(--ck-line-strong)",

        red: "var(--ck-red)",
        "red-press": "var(--ck-red-press)",
        volt: "var(--ck-volt)",
        "volt-press": "var(--ck-volt-press)",

        focus: "var(--ck-focus)",

        // legacy aliases kept so older components don't hard-break mid-migration
        crimson: "var(--ck-red)",
        paper: "var(--ck-bg-alt)",
        gum: "#C58A4E",
      },
      fontFamily: {
        display: ["var(--font-archivo-black)", "sans-serif"],
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-space-mono)", "monospace"],
        marker: ["var(--font-marker)", "cursive"],
        heading: ["var(--font-archivo-black)", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0",
        none: "0",
        xs: "2px",
        sm: "0",
        md: "0",
        lg: "0",
        xl: "0",
        "2xl": "0",
        "3xl": "0",
        full: "9999px",
      },
      boxShadow: {
        DEFAULT: "none",
        lift: "0 16px 40px rgba(11,11,11,0.18)",
      },
      letterSpacing: {
        "ultra-wide": "0.18em",
        display: "-0.03em",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0) rotate(0deg)" },
          "50%": { transform: "translateY(-16px) rotate(1deg)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "logo-pulse": {
          "0%, 100%": { transform: "scale(1)", opacity: "1" },
          "50%": { transform: "scale(1.08)", opacity: "0.85" },
        },
        "step-in": {
          "0%": { opacity: "0", transform: "translateY(8px) scale(0.8)" },
          "60%": { opacity: "1", transform: "translateY(-3px) scale(1.1)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        ticker: "ticker 26s linear infinite",
        float: "float 4.5s ease-in-out infinite",
        "spin-slow": "spin-slow 8s linear infinite",
        "logo-pulse": "logo-pulse 1.1s ease-in-out infinite",
        "step-in": "step-in 0.45s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
