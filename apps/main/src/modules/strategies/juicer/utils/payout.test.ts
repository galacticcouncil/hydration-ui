import { type Trade } from "@galacticcouncil/sdk-next/sor"
import { describe, expect, it } from "vitest"

import { type JuicerVaultConfig } from "@/modules/strategies/juicer/config/vaults"
import { type Papi } from "@/providers/rpcProvider"

import { buildPayoutSell, getPayoutAssetIds, getPayoutSell } from "./payout"

const unit = 10n ** 18n

describe("Payout sell", () => {
  const papi = {
    tx: {
      Router: {
        sell: (value: unknown) => ({
          decodedCall: { type: "Router", value: { type: "sell", value } },
        }),
      },
      Dispatcher: {
        dispatch_with_extra_gas: (value: unknown) => ({
          decodedCall: {
            type: "Dispatcher",
            value: { type: "dispatch_with_extra_gas", value },
          },
        }),
      },
    },
  } as unknown as Papi
  const input = {
    assetIn: 4200,
    assetOut: 34,
    amountIn: 3n * unit,
    minAmountOut: 2n * unit,
    swaps: [
      { pool: "Stableswap", poolId: 4200, assetIn: 4200, assetOut: 4 },
      { pool: "Omnipool", assetIn: 4, assetOut: 34 },
    ] as unknown as Trade["swaps"],
  }

  it("sells exactly the claimed collateral through the router, never sell_all", () => {
    expect(buildPayoutSell(papi, input).decodedCall).toMatchObject({
      type: "Router",
      value: {
        type: "sell",
        value: {
          asset_in: 4200,
          asset_out: 34,
          amount_in: 3n * unit,
          min_amount_out: 2n * unit,
          route: [{ asset_in: 4200 }, { asset_out: 34 }],
        },
      },
    })
  })

  it("wraps only when extra gas is set", () => {
    expect(
      buildPayoutSell(papi, { ...input, extraGas: 9n }).decodedCall,
    ).toMatchObject({
      type: "Dispatcher",
      value: {
        type: "dispatch_with_extra_gas",
        value: { extra_gas: 9n, call: { type: "Router" } },
      },
    })
  })
})

describe("Payout options", () => {
  const jeth: JuicerVaultConfig = {
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
