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
    "eqeqeq": ["error", "always"],
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
    // Options inline, not only in .prettierrc.json: prettier-eslint (IDE format on save) reads them from here.
    "prettier/prettier": ["error", require("../../.prettierrc.json")],
  },
}
