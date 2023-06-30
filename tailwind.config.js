const plugin = require("tailwindcss/plugin");
const defaultTheme = require("tailwindcss/defaultTheme");

module.exports = {
  darkMode: "class",
  mode: "jit",
  content: ["./index.html", "./src/**/*.{vue,ts}"],
  theme: {
    extend: {
      colors: {
        brand: {
          100: "#E6E0E8",
          200: "#CFC4E1",
          300: "#B8A9DA",
          400: "#A18ED3",
          500: "#4622B8",
        },
      },
      fontFamily: {
        sans: [...defaultTheme.fontFamily.sans],
        openSans: "'Open Sans', sans-serif",
        spartan: "'Spartan', sans-serif",
        paytone: "'Paytone', sans-serif",
      },
    },
  },
  plugins: [
    require("@tailwindcss/aspect-ratio"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    plugin(function ({ addVariant, e, postcss }) {
      addVariant("firefox", ({ container, separator }) => {
        const isFirefoxRule = postcss.atRule({
          name: "-moz-document",
          params: "url-prefix()",
        });
        isFirefoxRule.append(container.nodes);
        container.append(isFirefoxRule);
        isFirefoxRule.walkRules((rule) => {
          rule.selector = `.${e(
            `firefox${separator}${rule.selector.slice(1)}`
          )}`;
        });
      });
    }),
  ],
};
