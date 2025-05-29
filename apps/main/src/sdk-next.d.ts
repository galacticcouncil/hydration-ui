export * from "@galacticcouncil/sdk-next"

declare module "@galacticcouncil/sdk-next/build/types/sor" {
  import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"

  // TODO Trade interface is missing tradeFeeRange
  interface Trade {
    readonly tradeFeeRange?: [number, number]
  }
}
