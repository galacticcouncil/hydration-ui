import { CodegenConfig } from "@graphql-codegen/cli"

export default {
  schema: import.meta.env.VITE_SQUID_URL,
  overwrite: true,
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
        // graffle has problems with types or it crashes at runtime
        // documentMode: "string",
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
