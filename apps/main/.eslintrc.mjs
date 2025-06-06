module.exports = {
  root: true,
  extends: ["@galacticcouncil/eslint-config/index.js"],
  parserOptions: {
    project: "./tsconfig.json",
    tsconfigRootDir: __dirname,
  },
  ignorePatterns: ["__generated__"],
};