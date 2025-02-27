import { CodegenConfig } from "@graphql-codegen/cli"

const schemaFile = "schema.squid.graphql"

export default {
  overwrite: true,
  schema: process.env.VITE_SQUID_URL,
  generates: {
    [schemaFile]: {
      plugins: ["schema-ast"],
      config: {
        includeDirectives: true,
      },
    },
    "src/graphql/__generated__/squid/": {
      documents: ["src/**/*.squid.graphql"],
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
