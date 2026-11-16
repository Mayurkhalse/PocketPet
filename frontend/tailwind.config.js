/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        oled: {
          bg: "#05070a",
          card: "#0d131f",
          border: "#1e293b",
          blue: "#38bdf8",
          dim: "#64748b",
        },
      },
    },
  },
  plugins: [],
};

