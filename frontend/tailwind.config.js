import tailwindAnimate from "tailwindcss-animate";

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAFAFA",
        sidebar: "#FFFFFF",
        card: "#FFFFFF",
        border: "#E5E7EB",
        primary: {
          DEFAULT: "#111827",
          accent: "#2563EB",
        },
        secondary: "#6B7280",
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      borderRadius: {
        card: "12px",
      },
      boxShadow: {
        minimal: "0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
      }
    },
  },
  plugins: [tailwindAnimate],
}
