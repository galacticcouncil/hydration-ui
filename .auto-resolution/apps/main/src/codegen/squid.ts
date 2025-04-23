import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema: process.env.VITE_SQUID_URL,
  overwrite: true,
  // TODO remove this option when we have first squid indexer operations
  ignoreNoDocuments: true,
  generates: {
    "schema.squid.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/codegen/__generated__/squid/": {
      documents: ["src/**/*.squid.graphql"],
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
