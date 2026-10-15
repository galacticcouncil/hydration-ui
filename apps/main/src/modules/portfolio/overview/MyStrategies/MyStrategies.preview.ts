import { HOLLAR_BOND_24_11_26_ID } from "@galacticcouncil/utils"

import { AssetType, TBond } from "@/api/assets"
import { MyBond } from "@/modules/portfolio/overview/MyBonds/MyBondsTable.columns"
import { StrategyPosition } from "@/modules/portfolio/overview/MyStrategies/MyStrategies.data"

export const isLocalStrategyPreviewHost = (hostname: string) =>
  ["localhost", "127.0.0.1", "[::1]", "::1"].includes(hostname)

export const isStrategyPreviewEnabled = (
  hostname: string,
  requested: boolean | undefined,
  defaultEnabled: boolean,
) => isLocalStrategyPreviewHost(hostname) && (requested ?? defaultEnabled)

// Presentation fixtures only: never enter wallet balances, totals or writes.
export const STRATEGY_PREVIEW_POSITIONS: StrategyPosition[] = [
  {
    id: "preview:bil:supplied",
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
    isPendingWithdrawalEstimate: false,
    recoveryHollar: null,
    recoveryPending: false,
    status: "supplied",
    hasPosition: true,
    hasPendingWithdrawal: false,
    action: null,
    isPreview: true,
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
    id: `preview:juicer:${asset.symbol}`,
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
    isPendingWithdrawalEstimate: !!asset.pendingWithdrawal,
    recoveryHollar: null,
    recoveryPending: false,
    status: asset.pendingWithdrawal ? "withdrawing" : "active",
    hasPosition: true,
    hasPendingWithdrawal: !!asset.pendingWithdrawal,
    action: null,
    isPreview: true,
  })),
]

export const createStrategyPreviewBond = (
  registeredBond: TBond | undefined,
  iconSrc: string | undefined,
): MyBond => ({
  ...(registeredBond ?? {
    id: HOLLAR_BOND_24_11_26_ID,
    type: AssetType.BOND,
    symbol: "HOLLAR Bond",
    name: "HOLLAR Bond · 24 Nov 2026",
    underlyingAssetId: "222",
    maturity: Date.UTC(2026, 10, 24),
    decimals: 18,
    existentialDeposit: "0",
    isTradable: false,
    isSufficient: false,
    iconSrc,
  }),
  total: "1500",
  totalDisplay: "1500",
  isPreview: true,
})
