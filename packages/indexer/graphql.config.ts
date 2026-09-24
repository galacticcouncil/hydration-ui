import type { IGraphQLConfig } from "graphql-config"

export default {
  projects: {
    indexer: {
      schema: "./schema.indexer.graphql",
      documents: "./src/indexer/**/*.graphql",
    },
  },
} satisfies IGraphQLConfig
