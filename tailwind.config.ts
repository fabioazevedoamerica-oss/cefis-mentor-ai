import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cefis: {
          blue: "#1B3A6B",
          "blue-dark": "#0F1F3D",
          "blue-mid": "#254d8f",
          gold: "#C9A849",
          "gold-light": "#e0c06e",
          "gold-dark": "#a8882e",
          bg: "#F8F9FA",
          surface: "#FFFFFF",
        },
      },
      fontFamily: {
        montserrat: ["var(--font-montserrat)", "Montserrat", "sans-serif"],
      },
      boxShadow: {
        card: "0 2px 16px 0 rgba(27,58,107,0.08)",
        "card-hover": "0 8px 32px 0 rgba(27,58,107,0.16)",
        gold: "0 4px 16px 0 rgba(201,168,73,0.24)",
      },
      backgroundImage: {
        "hero-gradient": "linear-gradient(135deg, #0F1F3D 0%, #1B3A6B 60%, #254d8f 100%)",
        "gold-gradient": "linear-gradient(135deg, #C9A849 0%, #e0c06e 100%)",
        "card-gradient": "linear-gradient(135deg, #ffffff 0%, #f0f4ff 100%)",
      },
      animation: {
        "fade-up": "fadeUp 0.5s ease-out forwards",
        "fade-in": "fadeIn 0.4s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
