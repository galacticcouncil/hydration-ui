export * from "@galacticcouncil/sdk-next"

import { Binary, PolkadotClient } from "polkadot-api"

declare module "@galacticcouncil/sdk-next/build/types/sor" {
  import { Papi } from "@galacticcouncil/sdk-next/build/types/api"
  import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"

  interface Trade {
    readonly tradeFeeRange?: [number, number]
  }

  export declare class TradeUtils extends Papi {
    constructor(client: PolkadotClient)
    private isDirectOmnipoolTrade
    private tradeCheck
    buildBuyTx(trade: Trade, slippagePct?: number): Promise<Binary>
    buildSellTx(trade: Trade, slippagePct?: number): Promise<Binary>
    buildSellAllTx(trade: Trade, slippagePct?: number): Promise<Binary>
    public buildRoute
  }
}
