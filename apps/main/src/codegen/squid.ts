import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  generates: {
    "schema.squid.graphql": {
      schema: process.env.VITE_SQUID_URL,
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/codegen/__generated__/squid.ts": {
      schema: ["schema.squid.graphql"],
      documents: ["src/**/*.squid.graphql"],
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        defaultBaseOptions: {
          context: { clientName: "squid" },
        },
      },
    },
  },
  ignoreNoDocuments: true,
} satisfies CodegenConfig
