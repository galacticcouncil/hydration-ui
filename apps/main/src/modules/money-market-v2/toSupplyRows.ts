import type {
  MarketDescriptor,
  ReserveSummary,
} from "@galacticcouncil/money-market-v2/types"
import { MONEY_MARKET_STRATEGY_ASSETS } from "@galacticcouncil/utils"
import Big from "big.js"

import {
  isPoolShareReserve,
  isSwapInReserve,
  reserveAssetId,
} from "@/modules/money-market-v2/reserves"

export type ToSupplyRow = {
  reserve: Pick<ReserveSummary, "underlyingAsset" | "isIsolated">
  balance: string | undefined
  balanceUsd: string | undefined
  /** A swap-in reserve: pinned on top and supplied from any asset. */
  pinned?: boolean
}

const hasBalance = (row: ToSupplyRow) => !!row.balance && Big(row.balance).gt(0)

/**
 * The rows "Assets to supply" shows. Swap-in reserves lead, since a wallet
 * need not hold them to supply them: isolated reserves in the order given,
 * then pool-share ones in the order of `MONEY_MARKET_STRATEGY_ASSETS`.
 * Ordinary reserves follow, largest wallet balance first, and are held back
 * without a balance unless asked for or the wallet holds nothing at all.
 * `hidesZeroBalance` says whether there is an ordinary row to hold back.
 */
export const toSupplyRows = <T extends ToSupplyRow>({
  rows,
  market,
  showZeroBalance,
  inCategory,
}: {
  rows: readonly T[]
  market: MarketDescriptor
  showZeroBalance: boolean
  inCategory: (row: T) => boolean
}): { rows: T[]; hidesZeroBalance: boolean } => {
  const anyBalance = rows.some(hasBalance)
  const listed = rows.filter(inCategory)

  const poolShareIndex = (row: T) =>
    isPoolShareReserve(row.reserve.underlyingAsset, market)
      ? MONEY_MARKET_STRATEGY_ASSETS.indexOf(
          reserveAssetId(row.reserve.underlyingAsset, market),
        )
      : -1

  const pinned = listed
    .filter((row) => isSwapInReserve(row.reserve, market))
    .map((row) => ({ ...row, pinned: true }))
    .sort((a, b) => poolShareIndex(a) - poolShareIndex(b))

  const ordinary = listed
    .filter((row) => !isSwapInReserve(row.reserve, market))
    .sort((a, b) => Big(b.balanceUsd ?? 0).cmp(a.balanceUsd ?? 0))

  return {
    rows: [
      ...pinned,
      ...(showZeroBalance || !anyBalance
        ? ordinary
        : ordinary.filter(hasBalance)),
    ],
    hidesZeroBalance: anyBalance && ordinary.some((row) => !hasBalance(row)),
  }
}
