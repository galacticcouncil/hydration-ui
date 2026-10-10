import { summarizeNetApy } from "@galacticcouncil/money-market-v2/core"
import {
  useAccountSummary,
  useReserveSummaries,
} from "@galacticcouncil/money-market-v2/react"
import Big from "big.js"
import { useMemo } from "react"
import { Address } from "viem"

import {
  isNetApyLoading,
  NetApyState,
  toNetApyPositions,
} from "@/modules/money-market-v2/effectiveApy"
import type { SuppliedRow } from "@/modules/money-market-v2/MoneyMarketV2Tables"
import { useResolveReserveApy } from "@/modules/money-market-v2/ReserveApyProvider"

export const byUsdDesc =
  <T>(usd: (row: T) => string | undefined) =>
  (a: T, b: T) =>
    Big(usd(b) ?? 0).cmp(usd(a) ?? 0)

/**
 * The user's supplied and borrowed positions, largest first, with the account
 * figures both the dashboard and the position page summarize them by.
 */
export const usePositions = (user: Address | undefined) => {
  const reserves = useReserveSummaries()
  const account = useAccountSummary(user)
  const resolveApy = useResolveReserveApy()

  const { supplied, borrowed, netApy } = useMemo(() => {
    const byAsset = new Map(
      (reserves.data ?? []).map((r) => [r.underlyingAsset, r]),
    )
    const rows = (account.data?.positions ?? []).flatMap(
      (position): SuppliedRow[] => {
        const reserve = byAsset.get(position.underlyingAsset)
        return reserve ? [{ reserve, position }] : []
      },
    )

    // net APY runs on the effective APYs the surfaces display (ADR-0009)
    const apyRows = rows.map((row) => ({
      ...row,
      apy: resolveApy(row.reserve),
    }))
    const netApy: NetApyState = isNetApyLoading(apyRows)
      ? { status: "loading" }
      : { status: "ready", ...summarizeNetApy(toNetApyPositions(apyRows)) }

    return {
      netApy,
      supplied: rows
        .filter((r) => Big(r.position.underlyingBalance).gt(0))
        .sort(byUsdDesc((r) => r.position.underlyingBalanceUsd)),
      borrowed: rows
        .filter((r) => Big(r.position.variableBorrows).gt(0))
        .sort(byUsdDesc((r) => r.position.variableBorrowsUsd)),
    }
  }, [reserves.data, account.data, resolveApy])

  const acc = account.data?.account
  const maxBorrows = Big(acc?.totalBorrowsMarketReferenceCurrency ?? 0).plus(
    acc?.availableBorrowsMarketReferenceCurrency ?? 0,
  )

  return {
    reserves,
    account,
    acc,
    isLoading: !!user && account.isPending,
    supplied,
    borrowed,
    netApy,
    /** 0..1 */
    borrowPowerUsed: maxBorrows.eq(0)
      ? 0
      : Big(acc?.totalBorrowsMarketReferenceCurrency ?? 0)
          .div(maxBorrows)
          .toNumber(),
  }
}
