import { describe, expect, it } from "vitest"

import {
  getOtcMaxPartialFill,
  isOtcFullFill,
} from "@/modules/trade/otc/fill-order/FillOrder.utils"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { TAsset } from "@/providers/assetsProvider"

const USDC = {
  id: "22",
  decimals: 6,
  existentialDeposit: "10000",
} as TAsset

const HOLLARB = {
  id: "1001353",
  decimals: 18,
  existentialDeposit: "20000000000000000",
} as TAsset

const order: OtcOffer = {
  id: "1547",
  owner: "",
  assetIn: USDC,
  assetOut: HOLLARB,
  amountIn: "10000000000",
  amountOut: "10000000000000000000000",
  assetAmountIn: "10000",
  assetAmountOut: "10000",
  isPartiallyFillable: true,
}

describe("isOtcFullFill", () => {
  it("partially fills an amount just under the remaining order", () => {
    expect(isOtcFullFill(order, "9999")).toBe(false)
  })

  it("fully fills when the whole remaining amount is entered", () => {
    expect(isOtcFullFill(order, "10000")).toBe(true)
  })
})

describe("getOtcMaxPartialFill", () => {
  it("leaves the chain's minimum order amount in the order", () => {
    expect(getOtcMaxPartialFill(order, 5, "0.001").toString()).toBe(
      "9999.899899",
    )
  })
})
