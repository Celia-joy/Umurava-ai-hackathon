import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f9ff",
          100: "#dff2ff",
          200: "#b5e3ff",
          300: "#7dceff",
          400: "#3db4ff",
          500: "#1298f0",
          600: "#0c79c8",
          700: "#0e609f",
          800: "#124f83",
          900: "#15436d"
        }
      },
      boxShadow: {
        panel: "0 20px 50px rgba(18, 152, 240, 0.12)"
      },
      backgroundImage: {
        hero: "radial-gradient(circle at top left, rgba(61,180,255,0.22), transparent 40%), linear-gradient(135deg, #f8fdff, #eaf6ff)"
      }
    }
  },
  plugins: []
};

export default config;
