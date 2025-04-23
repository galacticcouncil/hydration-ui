import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema: process.env.VITE_INDEXER_URL,
  overwrite: true,
  generates: {
    "schema.indexer.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/codegen/__generated__/indexer/": {
      documents: ["src/**/*.indexer.graphql"],
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
        // documentMode: "string",
        avoidOptionals: {
          field: true,
          inputValue: false,
          object: true,
          defaultValue: true,
        },
        immutableTypes: true,
        preResolveTypes: true,
        onlyOperationTypes: true,
      },
    },
  },
} satisfies CodegenConfig
