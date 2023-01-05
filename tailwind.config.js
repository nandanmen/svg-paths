const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // Note the addition of the `app` directory.
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(0, 0%, 5%)",
        backgroundText: "hsl(200, 7.0%, 6.8%)",
      },
      fontFamily: {
        sans: ["Nunito", ...defaultTheme.fontFamily.sans],
        mono: ["Input Mono", ...defaultTheme.fontFamily.mono],
        serif: ["PP Editorial New", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [require("windy-radix-palette")],
};
