import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema: "https://archive.nice.hydration.cloud/graphql",
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
    "schema.indexer.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/indexer/__generated__/types.ts": {
      plugins: ["typescript"],
    },
    "src/indexer/__generated__/operations.ts": {
      documents: ["src/indexer/**/*.graphql"],
      plugins: ["typescript-operations"],
      preset: "import-types",
      presetConfig: {
        typesPath: "@/indexer/__generated__/types",
      },
    },
    "src/indexer/__generated__/sdk.ts": {
      documents: ["src/indexer/**/*.graphql"],
      plugins: ["typescript-graphql-request"],
      preset: "import-types",
      presetConfig: {
        typesPath: "@/indexer/__generated__/operations",
      },
      config: {
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
