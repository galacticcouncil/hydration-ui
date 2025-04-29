export default {
  createOldCatalogs: false,
  defaultNamespace: "common",
  lineEnding: "lf",
  locales: ["en"],
  output: "./src/i18n/locales/$LOCALE/$NAMESPACE.json",
  keySeparator: false,
  defaultValue: (_locale, namespace, key) => `${namespace}:${key}`,
  input: undefined,
  sort: true,
  verbose: false,
}
