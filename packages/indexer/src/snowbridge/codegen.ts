import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema:
    "https://snowbridge.squids.live/snowbridge-subsquid-polkadot@v1/api/graphql",
  overwrite: true,
  config: {
    preResolveTypes: true,
    onlyOperationTypes: true,
    defaultScalarType: "unknown",
    scalars: {
      DateTime: "string",
      JSON: "any",
    },
  },
  generates: {
    "schema.snowbridge.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/snowbridge/__generated__/types.ts": {
      plugins: ["typescript"],
    },
    "src/snowbridge/__generated__/operations.ts": {
      documents: ["src/snowbridge/**/*.graphql"],
      plugins: ["typescript-operations"],
      preset: "import-types",
      presetConfig: {
        typesPath: "@/snowbridge/__generated__/types",
      },
    },
    "src/snowbridge/__generated__/sdk.ts": {
      documents: ["src/snowbridge/**/*.graphql"],
      plugins: ["typescript-graphql-request"],
      preset: "import-types",
      presetConfig: {
        typesPath: "@/snowbridge/__generated__/operations",
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
