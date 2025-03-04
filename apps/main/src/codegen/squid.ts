import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema: process.env.VITE_SQUID_URL,
  generates: {
    "schema.squid.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/codegen/__generated__/squid.ts": {
      documents: ["src/**/*.squid.graphql"],
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
          context: { clientName: "squid" },
        },
      },
    },
  },
  ignoreNoDocuments: true,
} satisfies CodegenConfig
