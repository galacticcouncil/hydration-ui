import { describe, expect, it } from "vitest"

import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"

import {
  getDepositOptions,
  isOneToOneDeposit,
  isSwapDeposit,
  visibleDepositOptions,
} from "./depositOptions"

const jeth: PropellerVaultConfig = {
  assetId: "4200",
  vaultAddress: "0x0000000000000000000000000000000000000001",
  shareAssetId: "5552",
  shareSymbol: "jETH",
  shareName: "Juicer ETH",
  baseAssetId: "34",
}
const jbtc: PropellerVaultConfig = {
  assetId: "1000765",
  vaultAddress: "0x0000000000000000000000000000000000000002",
  shareAssetId: "5553",
  shareSymbol: "jBTC",
  shareName: "Juicer BTC",
}

describe("Deposit options", () => {
  it("offers each vault's base asset first, the raw collateral last", () => {
    expect(getDepositOptions([jeth, jbtc])).toEqual([
      { vault: jeth, assetId: "34" },
      { vault: jeth, assetId: "4200" },
      { vault: jbtc, assetId: "1000765" },
    ])
  })

  it("swaps only when paying with something other than the collateral", () => {
    expect(isSwapDeposit({ vault: jeth, assetId: "34" })).toBe(true)
    expect(isSwapDeposit({ vault: jeth, assetId: "4200" })).toBe(false)
    expect(isSwapDeposit({ vault: jbtc, assetId: "1000765" })).toBe(false)
  })

  it("treats GETH as a 1:1 deposit, not a swap", () => {
    const withGeth = { ...jeth, collateralDisplayId: "420" }
    expect(isOneToOneDeposit({ vault: withGeth, assetId: "420" })).toBe(true)
    expect(isOneToOneDeposit({ vault: withGeth, assetId: "34" })).toBe(false)
    expect(isOneToOneDeposit({ vault: withGeth, assetId: "4200" })).toBe(false)
  })

  it("keeps the listed pay assets behind the base asset", () => {
    const giga = { ...jeth, payAssetIds: ["420", "34"] }
    expect(getDepositOptions([giga]).map((o) => o.assetId)).toEqual([
      "34",
      "420",
      "4200",
    ])
  })

  it("hides the pool-share collateral at zero balance, unless it is the only or selected option", () => {
    const giga = { ...jeth, payAssetIds: ["420", "34", "27"] }
    const options = getDepositOptions([giga, jbtc])
    const ids = (
      balances: Record<string, bigint>,
      keep?: (typeof options)[number],
    ) =>
      visibleDepositOptions(options, (id) => balances[id] ?? 0n, keep).map(
        (o) => o.assetId,
      )
    expect(ids({})).toEqual(["34", "420", "27", "1000765"])
    expect(ids({ "4200": 1n })).toEqual(["34", "420", "27", "4200", "1000765"])
    expect(ids({}, { vault: giga, assetId: "4200" })).toContain("4200")
  })
})
