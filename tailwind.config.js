/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["'Noto Serif SC'", "serif"],
        sans: ["'Noto Sans SC'", "sans-serif"],
        kai: ["'LXGW WenKai'", "serif"],
        song: ["'Source Han Serif CN'", "serif"],
      },
      colors: {
        paper: "#faf8f3",
        sepia: "#f4ecd8",
        night: "#1a1a2e",
        ink: "#2c2c2c",
      },
    },
  },
  plugins: [],
};
