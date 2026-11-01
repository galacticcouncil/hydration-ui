import { describe, expect, it } from "vitest"

import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"

import { buildPayoutSell, getPayoutAssetIds, getPayoutSell } from "./payout"

const unit = 10n ** 18n
const route = [
  { pool: { type: "Stableswap", value: 4200 }, asset_in: 4200, asset_out: 4 },
  { pool: { type: "Omnipool", value: undefined }, asset_in: 4, asset_out: 34 },
]
const sellAll = {
  type: "Router",
  value: {
    type: "sell_all",
    value: {
      asset_in: 4200,
      asset_out: 34,
      min_amount_out: 2n * unit,
      route,
    },
  },
}
const withExtraGas = (call: unknown) => ({
  type: "Dispatcher",
  value: { type: "dispatch_with_extra_gas", value: { call, extra_gas: 1n } },
})
const sell = (amountIn: bigint, minAmountOut: bigint) => ({
  type: "Router",
  value: {
    type: "sell",
    value: {
      asset_in: 4200,
      asset_out: 34,
      amount_in: amountIn,
      min_amount_out: minAmountOut,
      route,
    },
  },
})

describe("Payout sell", () => {
  it("sells exactly the claimed collateral, not the whole balance, keeping the SDK's route and minimum", () => {
    expect(buildPayoutSell(sellAll, 3n * unit)).toEqual(
      sell(3n * unit, 2n * unit),
    )
  })

  it("resizes a sell the SDK already built", () => {
    expect(buildPayoutSell(sell(5n * unit, 2n * unit), 3n * unit)).toEqual(
      sell(3n * unit, 2n * unit),
    )
  })

  it("keeps the extra gas dispatch the SDK added for Aave legs", () => {
    expect(buildPayoutSell(withExtraGas(sellAll), 3n * unit)).toEqual(
      withExtraGas(sell(3n * unit, 2n * unit)),
    )
  })

  it("takes a caller's minimum over the SDK's, as the 1:1 GETH unwrap does", () => {
    expect(
      buildPayoutSell(withExtraGas(sellAll), 3n * unit, {
        minAmountOut: 3n * unit,
      }),
    ).toEqual(withExtraGas(sell(3n * unit, 3n * unit)))
  })

  it("refuses anything but a router sell", () => {
    for (const call of [
      { type: "Router", value: { type: "buy", value: {} } },
      {
        type: "Omnipool",
        value: { type: "sell", value: { asset_in: 4200, asset_out: 34 } },
      },
      withExtraGas(undefined),
      undefined,
    ])
      expect(() => buildPayoutSell(call, unit)).toThrow()
  })
})

describe("Payout options", () => {
  const jeth: PropellerVaultConfig = {
    assetId: "4200",
    vaultAddress: "0x0000000000000000000000000000000000000001",
    shareAssetId: "5552",
    shareSymbol: "jETH",
    shareName: "Juicer ETH",
    baseAssetId: "34",
    payoutAssetIds: ["420", "34", "1000809"],
  }

  it("offers the base asset first, selected by default, then the listed payouts", () => {
    expect(getPayoutAssetIds(jeth)).toEqual(["34", "420", "1000809"])
  })

  it("pays a vault without listed payouts in its collateral", () => {
    expect(
      getPayoutAssetIds({
        ...jeth,
        assetId: "1000765",
        baseAssetId: undefined,
        payoutAssetIds: undefined,
      }),
    ).toEqual(["1000765"])
  })

  it("swaps into the base asset or wstETH, unwraps 1:1 into GETH, and sells nothing for the collateral itself", () => {
    const vault = { ...jeth, collateralDisplayId: "420" }
    expect(getPayoutSell(vault, "34")).toBe("swap")
    expect(getPayoutSell(vault, "1000809")).toBe("swap")
    expect(getPayoutSell(vault, "420")).toBe("exact")
    expect(getPayoutSell(vault, "4200")).toBe("none")
  })
})
