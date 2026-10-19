import { describe, expect, it } from "vitest"

import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"

import {
  getDepositOptions,
  getVaultDepositOption,
  isSwapDeposit,
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
  it("offers each vault's collateral, then its base asset", () => {
    expect(getDepositOptions([jeth, jbtc])).toEqual([
      { vault: jeth, assetId: "4200" },
      { vault: jeth, assetId: "34" },
      { vault: jbtc, assetId: "1000765" },
    ])
  })

  it("swaps only when paying with something other than the collateral", () => {
    expect(isSwapDeposit({ vault: jeth, assetId: "34" })).toBe(true)
    expect(isSwapDeposit({ vault: jeth, assetId: "4200" })).toBe(false)
    expect(isSwapDeposit({ vault: jbtc, assetId: "1000765" })).toBe(false)
  })

  it("starts a vault's deposit on the base asset only when the wallet has no collateral", () => {
    const balances = (values: Record<string, bigint>) => (id: string) =>
      values[id] ?? 0n
    expect(getVaultDepositOption(jeth, balances({ "34": 1n })).assetId).toBe(
      "34",
    )
    expect(
      getVaultDepositOption(jeth, balances({ "34": 1n, "4200": 1n })).assetId,
    ).toBe("4200")
    expect(getVaultDepositOption(jeth, balances({})).assetId).toBe("4200")
    expect(getVaultDepositOption(jbtc, balances({ "34": 1n })).assetId).toBe(
      "1000765",
    )
  })

  it("offers the listed pay assets in order and starts on the first one held", () => {
    const giga = { ...jeth, payAssetIds: ["420", "34"] }
    const balances = (values: Record<string, bigint>) => (id: string) =>
      values[id] ?? 0n
    expect(getDepositOptions([giga]).map((o) => o.assetId)).toEqual([
      "4200",
      "420",
      "34",
    ])
    expect(
      getVaultDepositOption(giga, balances({ "34": 1n, "420": 1n })).assetId,
    ).toBe("420")
    expect(getVaultDepositOption(giga, balances({ "34": 1n })).assetId).toBe(
      "34",
    )
    expect(getVaultDepositOption(giga, balances({})).assetId).toBe("4200")
  })
})
