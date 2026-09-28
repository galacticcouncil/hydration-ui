import { Trade, TradeType } from "@galacticcouncil/sdk-next/sor"
import { describe, expect, it } from "vitest"

import { getIceSwapAmounts } from "@/modules/trade/swap/sections/XcSwap/lib/iceAmounts"

const trade = (type: TradeType) =>
  ({ type, amountIn: 1000n, amountOut: 2000n }) as Trade

describe("getIceSwapAmounts", () => {
  it("buy floors at the exact buy amount and pads what is paid", () => {
    expect(getIceSwapAmounts(trade(TradeType.Buy), 1)).toEqual({
      amountIn: 1010n,
      amountOut: 2000n,
    })
  })

  it("sell pays the exact sell amount and floors the output", () => {
    expect(getIceSwapAmounts(trade(TradeType.Sell), 1)).toEqual({
      amountIn: 1000n,
      amountOut: 1980n,
    })
  })
})
