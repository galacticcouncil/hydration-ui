import { describe, expect, it, vi } from "vitest"

import { AssetType } from "@/api/assets"
import { MyAsset } from "@/modules/portfolio/overview/MyAssets/MyAssetsTable.columns"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"
import { PROPELLER_VAULTS } from "@/modules/strategies/propeller/config/vaults"

import { mergePortfolioAssets } from "./PortfolioAssets.data"

vi.mock("@/api/assets", () => ({ AssetType: { BOND: "Bond", ERC20: "Erc20" } }))
// a GETH vault beside a plain one, whatever the live deployment lists
vi.mock(
  "@/modules/strategies/propeller/config/vaults",
  async (importOriginal) => ({
    ...(await importOriginal<
      typeof import("@/modules/strategies/propeller/config/vaults")
    >()),
    PROPELLER_VAULTS: [
      {
        assetId: "4200",
        vaultAddress: "0x0000000000000000000000000000000000000e01",
        shareAssetId: "5552",
        shareSymbol: "jETH",
        shareName: "Juicer ETH",
        baseAssetId: "34",
        payAssetIds: ["420", "34", "1000809"],
        payoutAssetIds: ["34", "420", "1000809"],
        collateralDisplayId: "420",
      },
      {
        assetId: "1000765",
        vaultAddress: "0x0000000000000000000000000000000000000b01",
        shareAssetId: "5553",
        shareSymbol: "jBTC",
        shareName: "Juicer BTC",
      },
    ],
  }),
)

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
const POSITIONS: StrategyPosition[] = [
  {
    id: "test:bil:supplied",
    strategy: "bil",
    assetId: "55",
    symbol: "BIL",
    name: "Brazilian Invoice Loans",
    amount: "1000",
    value: "1040",
    netValue: "800",
    borrowedValue: "240",
    underlyingAmount: "1040",
    underlyingSymbol: "HOLLAR",
    transferAssetId: null,
    rate: 18,
    rateKind: "apy",
    shareAmount: "1000",
    shareSymbol: "BIL",
    pendingEarnings: null,
    pendingWithdrawal: null,
    pendingWithdrawalValue: null,
    isPendingWithdrawalEstimate: false,
    recoveryHollar: null,
    recoveryPending: false,
    status: "supplied",
    hasPosition: true,
    hasPendingWithdrawal: false,
    action: null,
  },
  ...[
    {
      assetId: "34",
      symbol: "ETH",
      amount: "0.2",
      value: "560",
      rate: 1.81,
      pendingEarnings: "0.0012",
      pendingWithdrawal: null,
    },
    {
      assetId: "1000765",
      symbol: "tBTC",
      amount: "0.04",
      value: "3600",
      rate: 1.93,
      pendingEarnings: "0.00004",
      pendingWithdrawal: "0.01",
    },
  ].map<StrategyPosition>((asset) => ({
    ...asset,
    id: `test:juicer:${asset.symbol}`,
    strategy: "juicer",
    name: "Juicer",
    netValue: asset.value,
    borrowedValue: null,
    underlyingAmount: asset.amount,
    underlyingSymbol: asset.symbol,
    transferAssetId: null,
    rateKind: "apr",
    shareAmount: asset.amount,
    shareSymbol: asset.symbol,
    pendingWithdrawalValue: asset.pendingWithdrawal ? "900" : null,
    isPendingWithdrawalEstimate: !!asset.pendingWithdrawal,
    recoveryHollar: null,
    recoveryPending: false,
    status: asset.pendingWithdrawal ? "withdrawing" : "active",
    hasPosition: true,
    hasPendingWithdrawal: !!asset.pendingWithdrawal,
    action: null,
  })),
]

const getAsset = (id: string) => asset(id, id)

describe("combined portfolio assets", () => {
  it.each([false, true])(
    "keeps HDX first and interleaves strategy values (mobile: %s)",
    (isMobile) => {
      const wallet = [
        {
          ...asset("34", "ETH"),
          totalDisplay: "600",
          transferableDisplay: "600",
        },
        { ...asset("0", "HDX"), totalDisplay: "1", transferableDisplay: "1" },
        {
          ...asset("unknown", "Unknown"),
          totalDisplay: undefined,
          transferableDisplay: undefined,
        },
      ]
      const result = mergePortfolioAssets(wallet, POSITIONS, getAsset, isMobile)
      expect(result.map((row) => row.id)).toEqual([
        "0",
        POSITIONS[2]!.id,
        POSITIONS[0]!.id,
        "34",
        POSITIONS[1]!.id,
        "unknown",
      ])
    },
  )

  it("keeps a Juicer withdrawal in its row until claimed", () => {
    const result = mergePortfolioAssets([], POSITIONS, getAsset)
    const tbtc = result.find((row) => row.strategyPosition?.symbol === "tBTC")
    // 0.04 still in the position + 0.01 withdrawing; $3600 + $900
    expect(tbtc?.total).toBe("0.05")
    expect(tbtc?.totalDisplay).toBe("4500")
  })

  it("keeps wallet ETH and tBTC and gives their Juicer positions unique rows", () => {
    const result = mergePortfolioAssets(
      [asset("34", "ETH"), asset("1000765", "tBTC")],
      POSITIONS,
      getAsset,
    )
    expect(result).toHaveLength(5)
    expect(new Set(result.map((row) => row.id)).size).toBe(5)
    expect(
      result.find((row) => row.id === "34")?.strategyPosition,
    ).toBeUndefined()
    expect(
      result.find((row) => row.strategyPosition?.symbol === "ETH")?.total,
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
      ...POSITIONS[1]!,
      id: `juicer:${vault.vaultAddress}`,
      assetId: vault.assetId,
    }
    const result = mergePortfolioAssets(wallet, [position], getAsset)
    expect(result).toHaveLength(3)
    expect(result.some((row) => row.id === vault.shareAssetId)).toBe(false)
    expect(result.some((row) => row.id === vault.assetId)).toBe(true)
    expect(result.some((row) => row.id === otherVault.shareAssetId)).toBe(true)
  })

  it("keeps wallet holdings not represented by a successful live read", () => {
    const wallet = [asset("55", "BIL"), asset("550", "BIL")]
    const position = {
      ...POSITIONS[0]!,
      transferAssetId: "55",
    }
    const result = mergePortfolioAssets(wallet, [position], getAsset)
    expect(result.some((row) => row.id === "550")).toBe(true)
    expect(result.some((row) => row.id === "55")).toBe(false)
  })

  it("does not invent a supplied BIL transferable balance", () => {
    const live = POSITIONS.map((position) => ({
      ...position,
    }))
    const result = mergePortfolioAssets([], live, getAsset)
    expect(
      result.find((row) => row.strategyPosition?.strategy === "bil")
        ?.strategyTransferableKnown,
    ).toBe(false)
    expect(
      result.find((row) => row.strategyPosition?.strategy === "bil")
        ?.strategyPosition?.borrowedValue,
    ).toBe("240")
    expect(
      result.find((row) => row.strategyPosition?.id === POSITIONS[1]!.id)
        ?.strategyPosition?.pendingEarnings,
    ).toBe("0.0012")
  })

  it("lets a live Juicer position transfer, but not its withdrawal", () => {
    const result = mergePortfolioAssets([], POSITIONS, getAsset)
    const btc = result.find((row) => row.id === "test:juicer:tBTC")
    // Send moves the position's shares; the 0.01 in withdrawal stays escrowed
    expect(btc?.transferable).toBe("0.04")
    expect(btc?.transferableDisplay).toBe("3600")
    expect(btc?.total).toBe("0.05")
    expect(btc?.strategyTransferableKnown).toBe(true)
  })

  it("uses the actual raw BIL wallet transfer balance when available", () => {
    const wallet = asset("550", "BIL")
    const position = {
      ...POSITIONS[0]!,
      status: "wallet" as const,
      transferAssetId: "550",
    }
    const result = mergePortfolioAssets([wallet], [position], getAsset)
    expect(result[0]?.transferable).toBe("5")
    expect(result[0]?.strategyTransferableKnown).toBe(true)
    expect(wallet.id).toBe("550")
  })
})
