import { describe, expect, it } from "vitest"

import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"

import { selectDefaultDeposit } from "./defaultVault"
import { getDepositOptions } from "./depositOptions"

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
const options = getDepositOptions([jeth, jbtc])
const symbols = { "4200": "GIGAETH", "34": "ETH", "1000765": "tBTC" }
const select = (
  assetParam?: string,
  balancesUsd: Record<string, number> = {},
) => selectDefaultDeposit(options, { assetParam, symbols, balancesUsd })

describe("Default deposit option", () => {
  it("follows an asset symbol in the URL, including the swapped base asset", () => {
    expect(select("eth")).toEqual({ vault: jeth, assetId: "34" })
    expect(select("GIGAETH")).toEqual({ vault: jeth, assetId: "4200" })
    expect(select("tbtc", { "34": 9000 })).toEqual({
      vault: jbtc,
      assetId: "1000765",
    })
  })

  it("resolves a share symbol to that vault's richest option", () => {
    expect(select("jETH", { "34": 50, "1000765": 900 })).toEqual({
      vault: jeth,
      assetId: "34",
    })
    expect(select("jbtc")).toEqual({ vault: jbtc, assetId: "1000765" })
  })

  it("otherwise picks the richest option, ties in config order", () => {
    expect(select(undefined, { "34": 10, "1000765": 5 })).toEqual({
      vault: jeth,
      assetId: "34",
    })
    expect(select("unknown", { "4200": 5, "34": 5 })).toEqual({
      vault: jeth,
      assetId: "4200",
    })
    expect(select()).toEqual({ vault: jeth, assetId: "4200" })
    expect(selectDefaultDeposit([], { symbols, balancesUsd: {} })).toBeNull()
  })
})
