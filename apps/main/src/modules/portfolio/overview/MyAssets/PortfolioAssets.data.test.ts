import { describe, expect, it, vi } from "vitest"

import { AssetType } from "@/api/assets"
import { MyAsset } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"
import { STRATEGY_PREVIEW_POSITIONS } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.preview"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/config/vaults"

import { mergePortfolioAssets } from "./PortfolioAssets.data"

vi.mock("@/api/assets", () => ({ AssetType: { BOND: "Bond", ERC20: "Erc20" } }))

const asset = (id: string, symbol: string): MyAsset => ({
  id,
  symbol,
  name: symbol,
  type: AssetType.ERC20,
  decimals: 18,
  existentialDeposit: "0",
  isTradable: true,
  isSufficient: false,
  origin: null,
  canStake: false,
  total: "10",
  totalDisplay: "20",
  transferable: "5",
  transferableDisplay: "10",
})
const getAsset = (id: string) => asset(id, id)

describe("combined portfolio assets", () => {
  it("keeps wallet ETH and tBTC and gives their Juicer positions unique rows", () => {
    const result = mergePortfolioAssets(
      [asset("34", "ETH"), asset("1000765", "tBTC")],
      STRATEGY_PREVIEW_POSITIONS,
      getAsset,
    )
    expect(result).toHaveLength(5)
    expect(new Set(result.map((row) => row.id)).size).toBe(5)
    expect(
      result.find((row) => row.id === "34")?.strategyPosition,
    ).toBeUndefined()
    expect(
      result.find((row) => row.strategyPosition?.symbol === "GIGAETH")?.total,
    ).toBe("0.2")
  })

  it("represents upstream Juicer share holdings once and preserves unread holdings", () => {
    const vault = PROPELLER_VAULTS[0]!
    const otherVault = PROPELLER_VAULTS[1]!
    const wallet = [
      asset(vault.assetId, "ETH"),
      asset(vault.shareAssetId, "jETH"),
      asset(otherVault.shareAssetId, "jtBTC"),
    ]
    const position = {
      ...STRATEGY_PREVIEW_POSITIONS[1]!,
      isPreview: false,
      id: `juicer:${vault.vaultAddress}`,
    }
    const result = mergePortfolioAssets(wallet, [position], getAsset)
    expect(result).toHaveLength(3)
    expect(result.some((row) => row.id === vault.shareAssetId)).toBe(false)
    expect(result.some((row) => row.id === vault.assetId)).toBe(true)
    expect(result.some((row) => row.id === otherVault.shareAssetId)).toBe(true)
  })

  it("replaces duplicate BIL wallet rows in sample mode", () => {
    const result = mergePortfolioAssets(
      [asset("55", "BIL"), asset("550", "BIL")],
      STRATEGY_PREVIEW_POSITIONS,
      getAsset,
    )
    expect(result).toHaveLength(3)
    expect(result.filter((row) => row.symbol === "BIL")).toHaveLength(1)
  })

  it("keeps wallet holdings not represented by a successful live read", () => {
    const wallet = [asset("55", "BIL"), asset("550", "BIL")]
    const position = {
      ...STRATEGY_PREVIEW_POSITIONS[0]!,
      isPreview: false,
      transferAssetId: "55",
    }
    const result = mergePortfolioAssets(wallet, [position], getAsset)
    expect(result.some((row) => row.id === "550")).toBe(true)
    expect(result.some((row) => row.id === "55")).toBe(false)
  })

  it("does not invent live Juicer or supplied BIL transferable balances", () => {
    const live = STRATEGY_PREVIEW_POSITIONS.map((position) => ({
      ...position,
      isPreview: false,
    }))
    const result = mergePortfolioAssets([], live, getAsset)
    expect(result.every((row) => !row.strategyTransferableKnown)).toBe(true)
    expect(result[0]?.strategyPosition?.borrowedValue).toBe("240")
    expect(result[1]?.strategyPosition?.pendingEarnings).toBe("0.0012")
  })

  it("uses the actual raw BIL wallet transfer balance when available", () => {
    const wallet = asset("550", "BIL")
    const position = {
      ...STRATEGY_PREVIEW_POSITIONS[0]!,
      isPreview: false,
      status: "wallet" as const,
      transferAssetId: "550",
    }
    const result = mergePortfolioAssets([wallet], [position], getAsset)
    expect(result[0]?.transferable).toBe("5")
    expect(result[0]?.strategyTransferableKnown).toBe(true)
    expect(wallet.id).toBe("550")
  })
})
