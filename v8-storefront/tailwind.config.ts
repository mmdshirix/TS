import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      fontFamily: {
        sans: ["Vazirmatn", "Vazir", "system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
        "iran-sans": ["IRANSansXFaNum", "Vazirmatn", "system-ui", "-apple-system", "Segoe UI", "Arial", "sans-serif"],
      },
      colors: {
        brand: "var(--store-primary, #2563eb)",
        "brand-secondary": "var(--store-secondary, #0ea5e9)",
        "brand-surface": "var(--store-surface, #f0f9ff)",
      },
      borderRadius: {
        brand: "var(--store-radius, 0.5rem)",
      },
    },
    screens: {
      xs: "475px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
  plugins: [],
} satisfies Config

export default config
