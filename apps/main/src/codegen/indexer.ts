import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema: process.env.VITE_INDEXER_URL,
  documents: ["src/**/*.graphql"],
  generates: {
    "schema.indexer.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "./src/codegen/__generated__/index.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
      },
    },
  },
} satisfies CodegenConfig
