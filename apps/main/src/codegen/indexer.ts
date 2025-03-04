import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema: process.env.VITE_INDEXER_URL,
  generates: {
    "schema.indexer.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/codegen/__generated__/indexer.ts": {
      documents: ["src/**/*.indexer.graphql"],
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
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
        withHooks: true,
        defaultBaseOptions: {
          context: { clientName: "indexer" },
        },
      },
    },
  },
} satisfies CodegenConfig
