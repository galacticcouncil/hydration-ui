import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  generates: {
    "schema.indexer.graphql": {
      schema: process.env.VITE_INDEXER_URL,
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/codegen/__generated__/indexer.ts": {
      schema: ["schema.indexer.graphql"],
      documents: ["src/**/*.indexer.graphql"],
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        defaultBaseOptions: {
          context: { clientName: "indexer" },
        },
      },
    },
  },
} satisfies CodegenConfig
