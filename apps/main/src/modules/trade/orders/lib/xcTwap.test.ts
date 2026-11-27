import { describe, expect, it } from "vitest"

import {
  getXcOrderTxLink,
  getXcPayoutAmount,
  getXcPayoutTxLink,
  getXcTwapReceived,
  xcTwapOf,
} from "@/modules/trade/orders/lib/xcTwap"
import {
  dcaIntent,
  DISPATCHER,
  forward,
  swapIntent,
} from "@/modules/trade/orders/lib/xcTwap.fixture"

describe("xcTwapOf", () => {
  it("decodes the forward of a live xc TWAP", () => {
    const result = xcTwapOf(dcaIntent(forward()))

    expect(result).not.toBeNull()
    expect(result?.authPath.startsWith("0x3a6dae64")).toBe(true)
    expect(result?.depositAddress.toLowerCase()).toBe(
      "0x0221a7568a88c46b619a439399ae60fed55cff23",
    )
    expect(result?.maxRelayFee).toBe(154983487432464n)
    expect(result?.terms.recipient).toBe("t1RPpso7PVchSGWpGXEmcUHRDuTEux1tkvE")
    expect(result?.terms.destinationAsset).toBe("nep141:zec.omft.near")
    expect(result?.terms.minDelivery).toBe(450000n)
    expect(result?.terms.owner.toLowerCase()).toBe(
      "0x26f5c2370e563e9f4dda435f03a63d7c109d8d04",
    )
  })

  it("matches the dispatcher case-insensitively", () => {
    expect(
      xcTwapOf(dcaIntent(forward(DISPATCHER.toUpperCase()))),
    ).not.toBeNull()
  })

  it("ignores a Swap with the same forward", () => {
    expect(xcTwapOf(swapIntent(forward()))).toBeNull()
  })

  it("ignores a DCA without a forward", () => {
    expect(xcTwapOf(dcaIntent(undefined))).toBeNull()
  })

  it("ignores a forward to another contract", () => {
    expect(
      xcTwapOf(
        dcaIntent(forward("0x1111111111111111111111111111111111111111")),
      ),
    ).toBeNull()
  })

  it("ignores garbage forward data", () => {
    expect(
      xcTwapOf(dcaIntent(forward(DISPATCHER, new Uint8Array([1, 2, 3])))),
    ).toBeNull()
  })
})

const ZEC_LEDGER = "nep141:zec.omft.near"
const BTC_LEDGER = "nep141:nbtc.bridge.near"
const NEAR_LEDGER = "nep141:wrap.near"
const ZEC = { symbol: "ZEC", decimals: 8 }
const NEAR_SIGNED = { txHash: "Kew66WeYdg5Vejq2nZR2KLwMF8Mjm7m7SGNGAcV8Jak" }

describe("getXcOrderTxLink", () => {
  it("links the published Hydration extrinsic", () => {
    expect(
      getXcOrderTxLink({
        published: { txHash: "0x91b2…-20", extrinsic: "17193876-2" },
      }),
    ).toMatch(/\/extrinsic\/17193876-2$/)
  })

  it("is null without a published extrinsic", () => {
    expect(getXcOrderTxLink({ published: null })).toBeNull()
    expect(
      getXcOrderTxLink({ published: { txHash: "0x1", extrinsic: null } }),
    ).toBeNull()
    expect(
      getXcOrderTxLink({ published: { txHash: "0x1", extrinsic: "junk" } }),
    ).toBeNull()
  })
})

describe("getXcPayoutTxLink", () => {
  const delivered = {
    state: "delivered" as const,
    dest_tx: "46df6ca6",
    signed: NEAR_SIGNED,
  }

  it("links ZEC payouts to 3xpl", () => {
    expect(getXcPayoutTxLink(ZEC_LEDGER, delivered)).toBe(
      "https://3xpl.com/zcash/transaction/46df6ca6",
    )
  })

  it("links BTC payouts to blockchair", () => {
    expect(getXcPayoutTxLink(BTC_LEDGER, delivered)).toBe(
      "https://blockchair.com/bitcoin/transaction/46df6ca6",
    )
  })

  it("links NEAR payouts to nearblocks", () => {
    expect(getXcPayoutTxLink(NEAR_LEDGER, delivered)).toBe(
      `https://nearblocks.io/txns/${NEAR_SIGNED.txHash}`,
    )
  })

  it("falls back to the NEAR tx until the destination tx exists, and for refunds", () => {
    expect(getXcPayoutTxLink(ZEC_LEDGER, { ...delivered, dest_tx: null })).toBe(
      `https://nearblocks.io/txns/${NEAR_SIGNED.txHash}`,
    )
    expect(
      getXcPayoutTxLink(ZEC_LEDGER, { ...delivered, state: "refunded" }),
    ).toBe(`https://nearblocks.io/txns/${NEAR_SIGNED.txHash}`)
  })

  it("is null with no tx at all", () => {
    expect(
      getXcPayoutTxLink(ZEC_LEDGER, {
        ...delivered,
        dest_tx: null,
        signed: null,
      }),
    ).toBeNull()
  })
})

describe("getXcPayoutAmount", () => {
  it("prefers the net dest_amount", () => {
    expect(
      getXcPayoutAmount(
        { state: "delivered", amount: "514493", dest_amount: "442493" },
        ZEC,
      ),
    ).toEqual({ value: "0.00442493", symbol: "ZEC" })
  })

  it("uses the gross amount until confirmed", () => {
    expect(
      getXcPayoutAmount(
        { state: "delivered", amount: "514493", dest_amount: null },
        ZEC,
      ),
    ).toEqual({ value: "0.00514493", symbol: "ZEC" })
  })

  it("shows refunds in ETH, even without a destination", () => {
    expect(
      getXcPayoutAmount(
        { state: "refunded", amount: "2000000000000000", dest_amount: null },
        null,
      ),
    ).toEqual({ value: "0.002", symbol: "ETH" })
  })

  it("is null for a delivery without a destination", () => {
    expect(
      getXcPayoutAmount(
        { state: "delivered", amount: "1", dest_amount: "1" },
        null,
      ),
    ).toBeNull()
  })
})

describe("getXcTwapReceived", () => {
  it("adds held to received in destination units", () => {
    expect(getXcTwapReceived({ received: "1500000", held: "500000" }, 8)).toBe(
      "0.02",
    )
    expect(getXcTwapReceived({ received: "1500000", held: null }, 8)).toBe(
      "0.015",
    )
  })
})
