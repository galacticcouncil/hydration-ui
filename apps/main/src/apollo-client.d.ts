import "@apollo/client"

declare module "@apollo/client" {
  interface DefaultContext {
    readonly clientName: "indexer" | "squid"
  }
}
