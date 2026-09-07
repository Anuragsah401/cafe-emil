/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        emil: {
          red: "#D72A16",
          redHover: "#B82211",
          redDark: "#8B1519",
          redLight: "#FEF2F2",
          redTint: "rgba(215, 42, 22, 0.12)",
          redGlow: "rgba(215, 42, 22, 0.35)",
          bg: "#100D0E",
          card: "#181415",
          cardHover: "#221B1D",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(215, 42, 22, 0.4)",
          text: "#FFFFFF",
          muted: "#A19999",
          sub: "#756B6B",
        },
        yumix: {
          bg: "#100D0E",
          card: "#181415",
          cardHover: "#221B1D",
          border: "rgba(255, 255, 255, 0.08)",
          borderHover: "rgba(215, 42, 22, 0.4)",
          yellow: "#D72A16",
          yellowHover: "#B82211",
          yellowDark: "#8B1519",
          text: "#FFFFFF",
          muted: "#A19999",
          sub: "#756B6B",
        },
        cream: {
          50: "#FAF8F5",
          100: "#F4ECE1",
          200: "#EBDDC9",
        },
        espresso: {
          900: "#181415",
          950: "#100D0E",
        },
        amberGold: {
          400: "#D72A16",
          500: "#B82211",
          600: "#8B1519",
        },
      },
      fontFamily: {
        sans: ["Plus Jakarta Sans", "Inter", "system-ui", "-apple-system", "sans-serif"],
        serif: ["Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
      },
    },
  },
  plugins: [],
};
