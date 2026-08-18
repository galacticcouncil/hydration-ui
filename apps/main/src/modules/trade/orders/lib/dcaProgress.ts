import Big from "big.js"

import { useAccountBalances } from "@/api/balances"
import { TAsset } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const useDcaFundingBalance = (
  from: TAsset | undefined,
  isOpenBudget: boolean,
): string | null => {
  const { getTransferableBalance, isBalanceLoading } = useAccountBalances()

  if (!isOpenBudget || !from || isBalanceLoading) return null

  return scaleHuman(getTransferableBalance(from.id).toString(), from.decimals)
}

export const getDcaCompletionPercent = ({
  sold,
  total,
  isOpenBudget,
  fundingBalance,
}: {
  readonly sold: string | null | undefined
  readonly total: string | null | undefined
  readonly isOpenBudget: boolean
  readonly fundingBalance: string | null
}): number | null => {
  if (sold === undefined || sold === null) return null

  try {
    const filled = Big(sold)

    if (isOpenBudget) {
      if (fundingBalance === null) return null

      const denominator = filled.plus(fundingBalance)
      if (denominator.lte(0)) return null
      if (filled.gte(denominator)) return 100

      return filled.div(denominator).mul(100).toNumber()
    }

    if (total === undefined || total === null) return null

    const totalAmount = Big(total)
    if (totalAmount.lte(0)) return null

    return filled.div(totalAmount).mul(100).toNumber()
  } catch {
    return null
  }
}

export const getDcaTradeProgress = ({
  sold,
  total,
  singleTradeSize,
  isOpenBudget,
  fundingBalance,
}: {
  readonly sold: string | null | undefined
  readonly total: string | null | undefined
  readonly singleTradeSize: string | null | undefined
  readonly isOpenBudget: boolean
  readonly fundingBalance: string | null
}): { executed: number; remaining: number } | null => {
  if (
    sold === undefined ||
    sold === null ||
    singleTradeSize === undefined ||
    singleTradeSize === null
  ) {
    return null
  }

  try {
    const perTrade = Big(singleTradeSize)
    if (perTrade.lte(0)) return null

    const filled = Big(sold)
    const executed = filled.div(perTrade).round(0, Big.roundDown).toNumber()

    let left: Big
    if (isOpenBudget) {
      if (fundingBalance === null) return null
      left = Big(fundingBalance)
    } else {
      if (total === undefined || total === null) return null
      const budget = Big(total)
      if (budget.lte(0)) return null
      left = budget.gt(filled) ? budget.minus(filled) : Big(0)
    }

    const remaining = left.div(perTrade).round(0, Big.roundUp).toNumber()

    if (!Number.isFinite(executed) || !Number.isFinite(remaining)) return null
    if (executed < 0 || remaining < 0) return null

    return { executed, remaining }
  } catch {
    return null
  }
}
