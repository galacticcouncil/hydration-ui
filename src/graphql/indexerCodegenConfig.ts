import { CodegenConfig } from "@graphql-codegen/cli"

const schemaFile = "schema.indexer.graphql"

export default {
  // TODO Remove ignoreNoDocuments after first usage
  ignoreNoDocuments: true,
  overwrite: true,
  generates: {
    [schemaFile]: {
      schema: process.env.VITE_INDEXER_URL,
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/graphql/__generated__/indexer/": {
      documents: ["src/**/*.indexer.graphql"],
      schema: [schemaFile],
      preset: "client",
      presetConfig: {
        fragmentMasking: false,
      },
      config: {
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
