import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "rgb(var(--color-paper) / <alpha-value>)",
        ink: "rgb(var(--color-ink) / <alpha-value>)",
        indigo: {
          DEFAULT: "rgb(var(--color-indigo) / <alpha-value>)",
          50: "#EEF1F8",
          100: "#D6DCEC",
          200: "#AEB9D9",
          300: "#8695C4",
          400: "#5E71AE",
          500: "#3E4F87",
          600: "#2B3A67",
          700: "#212C4F",
          800: "#171F38",
          900: "#0D1220",
        },
        amber: {
          DEFAULT: "rgb(var(--color-amber) / <alpha-value>)",
          50: "#FDF6E9",
          100: "#FBEAC8",
          200: "#F6D591",
          300: "#F1BF5A",
          400: "#EBAC45",
          500: "#E8A33D",
          600: "#C6822A",
          700: "#96631F",
          800: "#664315",
          900: "#33220B",
        },
        teal: {
          DEFAULT: "rgb(var(--color-teal) / <alpha-value>)",
          50: "#E7F5F1",
          100: "#C3E6DC",
          500: "#1F8A70",
          600: "#186E5A",
          700: "#125342",
        },
        line: "rgb(var(--color-line) / <alpha-value>)",
        danger: "#C0432E",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      borderRadius: {
        xs: "10px",
      },
      boxShadow: {
        panel: "0 1px 2px 0 rgb(var(--color-ink) / 0.04), 0 0 0 1px rgb(var(--color-line) / 0.4)",
        lift: "0 14px 32px -14px rgb(var(--color-indigo) / 0.35)",
      },
      backgroundImage: {
        "grid-faint":
          "linear-gradient(rgb(var(--color-line) / 0.5) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-line) / 0.5) 1px, transparent 1px)",
      },
      keyframes: {
        "cursor-blink": {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(6px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "cursor-blink": "cursor-blink 1s step-end infinite",
        "fade-up": "fade-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
