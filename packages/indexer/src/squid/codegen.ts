import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema:
    "https://galacticcouncil.squids.live/hydration-pools:whale-prod/api/graphql",
  overwrite: true,
  generates: {
    "schema.squid.graphql": {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/squid/__generated__/types.ts": {
      plugins: ["typescript"],
    },
    "src/squid/__generated__/operations.ts": {
      documents: ["src/squid/**/*.graphql"],
      plugins: ["typescript-operations"],
      preset: "import-types",
      presetConfig: {
        typesPath: "@/squid/__generated__/types",
      },
    },
    "src/squid/__generated__/sdk.ts": {
      documents: ["src/squid/**/*.graphql"],
      plugins: ["typescript-graphql-request"],
      preset: "import-types",
      presetConfig: {
        typesPath: "@/squid/__generated__/operations",
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
