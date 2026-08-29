import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-plus-jakarta)", "Plus Jakarta Sans", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        swatch: {
          ice: "#ebf4ff",
          sky: "#85c1f5",
          blue: "#0088f5",
          navy: "#0043a8",
        },
        palette: {
          light: "#90D5FF",  // Light Sky / Ice Blue
          vivid: "#57B9FF",  // Vivid Sky Blue
          slate: "#77B1D4",  // Muted Slate Blue
          deep: "#517891",   // Deep Denim Blue
        },
        factory: {
          dark: "#f0f7ff",
          card: "#ffffff",
          border: "#bfdbfe",
          text: "#0c2b64",
          amber: "#0088f5",
          cyan: "#0284c7",
          emerald: "#059669",
          rose: "#e11d48",
          blueLight: "#90D5FF",
          blueSky: "#57B9FF",
          blueBright: "#77B1D4",
          blueNavy: "#517891",
        },
      },
      keyframes: {
        'aurora-flow': {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
        'liquid-refract': {
          '0%': { transform: 'scale(1) rotate(0deg)' },
          '50%': { transform: 'scale(1.03) rotate(1deg)' },
          '100%': { transform: 'scale(1) rotate(0deg)' },
        },
        'clay-pulse': {
          '0%, 100%': { transform: 'translateY(0) scale(1)' },
          '50%': { transform: 'translateY(-4px) scale(1.02)' },
        },
      },
      animation: {
        'aurora-flow': 'aurora-flow 8s ease infinite',
        'liquid-refract': 'liquid-refract 6s ease-in-out infinite',
        'clay-pulse': 'clay-pulse 4s ease-in-out infinite',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
