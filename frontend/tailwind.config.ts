import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f2f8ff",
          100: "#e4f1ff",
          200: "#c6e2ff",
          300: "#9cd0ff",
          400: "#69b8ff",
          500: "#339dff",
          600: "#1f83e6",
          700: "#1a68b8",
          800: "#184f8c",
          900: "#153f6f"
        }
      },
      boxShadow: {
        panel: "0 18px 46px rgba(15, 23, 42, 0.08)"
      },
      backgroundImage: {
        hero: "linear-gradient(135deg, #ffffff, #f2f8ff)"
      }
    }
  },
  plugins: []
};

export default config;
