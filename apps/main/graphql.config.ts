import type { IGraphQLConfig } from "graphql-config"

export default {
  schema: "./schema.indexer.graphql",
  documents: "./src/**/*.graphql",
} satisfies IGraphQLConfig
