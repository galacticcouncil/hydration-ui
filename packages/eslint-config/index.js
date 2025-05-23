module.exports = {
  parser: "@typescript-eslint/parser",
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
  ],
  plugins: [
    "@typescript-eslint",
    "react-hooks",
    "prettier",
    "simple-import-sort",
  ],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
  },
  settings: {
    react: {
      version: "detect",
    },
  },
  rules: {
    "react/react-in-jsx-scope": "off",
    "react/prop-types": "off",
    "react/button-has-type": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
    ],
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "react/no-unknown-property": ["error", { ignore: ["css", "sx"] }],
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          {
            group: ["./*/", "**../"],
            message: "Use absolute imports",
          },
        ],
      },
    ],
    "prettier/prettier": [
      "error",
      {
        semi: false,
        trailingComma: "all",
        arrowParens: "always",
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        jsxSingleQuote: false,
        endOfLine: "auto",
      },
    ],
  },
}
