// @ts-check

/**
 * @see https://prettier.io/docs/configuration
 * @type {import("prettier").Config}
 */
const config = {
  trailingComma: "es5",
  tabWidth: 2,
  useTabs: true,
  semi: false,
  singleQuote: true,
  printWidth: 100,
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-packagejson",
  ],
  importOrderTypeScriptVersion: "5.5.4",
  overrides: [
    {
      files: ["*.jsonc", "*.code-workspace"],
      options: {
        trailingComma: "none",
      },
    },
    {
      files: "Justfile",
      options: {
        useTabs: false,
      },
    },
  ],
};

export default config;
