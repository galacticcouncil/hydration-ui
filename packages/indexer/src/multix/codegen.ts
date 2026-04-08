import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema: "https://hydration.graphql.multix.cloud/graphql",
  overwrite: true,
  config: {
    preResolveTypes: true,
    onlyOperationTypes: true,
    defaultScalarType: "unknown",
    scalars: {
      BigFloat: "string",
      Datetime: "string",
      JSON: "any",
    },
  },
  generates: {
    "schema.multix.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/multix/__generated__/types.ts": {
      plugins: ["typescript"],
    },
    "src/multix/__generated__/operations.ts": {
      documents: ["src/multix/**/*.graphql"],
      plugins: ["typescript-operations"],
      preset: "import-types",
      presetConfig: {
        typesPath: "@/multix/__generated__/types",
      },
    },
    "src/multix/__generated__/sdk.ts": {
      documents: ["src/multix/**/*.graphql"],
      plugins: ["typescript-graphql-request"],
      preset: "import-types",
      presetConfig: {
        typesPath: "@/multix/__generated__/operations",
      },
      config: {
        documentMode: "string",
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: false,
          defaultValue: true,
        },
        immutableTypes: true,
        preResolveTypes: true,
        onlyOperationTypes: true,
      },
    },
  },
} satisfies CodegenConfig
