import { authPathOf } from "@galacticcouncil/xc-intents"
import { decodeAbiParameters } from "viem"
import { describe, expect, it } from "vitest"

import {
  type GetAsset,
  intentEntryToOrder,
  withXcTwapTrade,
} from "@/modules/trade/orders/lib/buildOrderRows"
import {
  getXcTwapInfo,
  OrderKind,
  XcDestinationDisplay,
} from "@/modules/trade/orders/lib/orderData"
import {
  dcaIntent,
  forward,
  FORWARD_DATA,
} from "@/modules/trade/orders/lib/xcTwap.fixture"
import type { TAsset } from "@/providers/assetsProvider"

const HOLLAR = { id: "222", symbol: "HOLLAR", decimals: 18 } as TAsset
const WETH = {
  id: "20",
  symbol: "WETH",
  decimals: 18,
  existentialDeposit: "5000000000000",
} as TAsset

const getAsset: GetAsset = (id) => (String(id) === "20" ? WETH : HOLLAR)

const ZEC: XcDestinationDisplay = {
  symbol: "ZEC",
  decimals: 8,
  logo: "zec.svg",
  chainLogo: "zcash.svg",
}

const getXcDestination = (ledgerId: string) =>
  ledgerId === "nep141:zec.omft.near" ? ZEC : null

const ID = 33113655064623107617176158217601n

describe("intentEntryToOrder: xc TWAP", () => {
  it("builds an xc row from a live xc TWAP intent", () => {
    const order = intentEntryToOrder(
      { id: ID, intent: dcaIntent(forward()) },
      getAsset,
      getXcDestination,
    )

    expect(order?.kind).toBe(OrderKind.Dca)
    expect(order && "limitPrice" in order && order.limitPrice).toBeNull()
    expect(order?.fromAmountBudget).toBe("5.55")
    expect(order && "singleTradeSize" in order && order.singleTradeSize).toBe(
      "1.85",
    )

    const xc = order && getXcTwapInfo(order)
    expect(xc?.authPath.startsWith("0x3a6dae64")).toBe(true)
    expect(xc?.terms.recipient).toBe("t1RPpso7PVchSGWpGXEmcUHRDuTEux1tkvE")
    expect(xc?.destination).toEqual(ZEC)
  })

  it("keeps the xc row when the destination is unknown", () => {
    const order = intentEntryToOrder(
      { id: ID, intent: dcaIntent(forward()) },
      getAsset,
    )

    const xc = order && getXcTwapInfo(order)
    expect(xc?.destination).toBeNull()
    expect(order && "limitPrice" in order && order.limitPrice).toBeNull()
  })

  it("leaves a plain DCA into WETH unchanged", () => {
    const order = intentEntryToOrder(
      { id: ID, intent: dcaIntent(undefined) },
      getAsset,
      getXcDestination,
    )

    expect(order && getXcTwapInfo(order)).toBeNull()
    // amount_out is above WETH's ED, so today's rule classes it as a limit TWAP
    expect(order && "limitPrice" in order && order.limitPrice).not.toBeNull()
  })
})

describe("withXcTwapTrade", () => {
  const [, , packed] = decodeAbiParameters(
    [{ type: "address" }, { type: "uint256" }, { type: "bytes" }],
    FORWARD_DATA,
  )
  const trade = { auth_path: authPathOf(packed), terms: packed }
  const plainDca = () =>
    intentEntryToOrder({ id: ID, intent: dcaIntent(undefined) }, getAsset)!

  it("relabels a history row from its scan trade", () => {
    const order = withXcTwapTrade(plainDca(), trade, getXcDestination)

    const xc = getXcTwapInfo(order)
    expect(xc?.authPath).toBe(trade.auth_path)
    expect(xc?.terms.recipient).toBe("t1RPpso7PVchSGWpGXEmcUHRDuTEux1tkvE")
    expect(xc?.destination).toEqual(ZEC)
    expect("limitPrice" in order && order.limitPrice).toBeNull()
    expect(order.fromAmountBudget).toBe("5.55")
  })

  it("leaves the row as it is without a trade or with bad terms", () => {
    const order = plainDca()

    expect(withXcTwapTrade(order, undefined, getXcDestination)).toBe(order)
    expect(withXcTwapTrade(order, null, getXcDestination)).toBe(order)
    expect(
      withXcTwapTrade(
        order,
        { auth_path: trade.auth_path, terms: "0xdead" },
        getXcDestination,
      ),
    ).toBe(order)
  })

  it("never relabels a limit order", () => {
    const limit = { ...plainDca(), kind: OrderKind.Limit } as never

    expect(withXcTwapTrade(limit, trade, getXcDestination)).toBe(limit)
  })
})
