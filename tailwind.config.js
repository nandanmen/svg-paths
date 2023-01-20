const defaultTheme = require("tailwindcss/defaultTheme");
const radix = require("@radix-ui/colors");
const plugin = require("tailwindcss/plugin");

const radixColors = plugin.withOptions(
  ({ colors = radix } = {}) => {
    let rootColors = {};
    let darkModeColors = {};

    for (const [colorName, colorObj] of Object.entries(colors)) {
      const colorMap = colorName.includes("Dark") ? darkModeColors : rootColors;
      for (const [key, value] of Object.entries(colorObj)) {
        colorMap[`--${key}`] = value;
      }
    }

    return ({ addBase }) => {
      addBase({
        ":root": rootColors,
      });
    };
  },
  ({ colors = radix } = {}) => {
    const themeColors = {};

    for (const [colorName, colorObj] of Object.entries(colors)) {
      if (colorName.includes("Dark")) {
        continue;
      }

      const themeColor = {};
      for (const key of Object.keys(colorObj)) {
        const scale = key.replace(colorName, "");
        themeColor[scale] = `var(--${colorName}${scale})`;
      }

      themeColors[colorName] = themeColor;
    }

    return {
      theme: {
        extend: {
          colors: themeColors,
        },
      },
    };
  }
);

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
        background: "hsl(0, 0%, 8%)",
        backgroundText: "hsl(200, 7.0%, 10%)",
      },
      fontFamily: {
        sans: ["Nunito", ...defaultTheme.fontFamily.sans],
        mono: ["Input Mono", ...defaultTheme.fontFamily.mono],
        serif: ["PP Editorial New", ...defaultTheme.fontFamily.serif],
      },
    },
  },
  plugins: [radixColors],
};
