import Big from "big.js"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useMaxBalanceWithFee } from "@/modules/transactions/hooks/useMaxBalanceWithFee"
import { type AnyTransaction } from "@/modules/transactions/types"

/** the buffer the liquidity forms use; absorbs a route the reference didn't take */
const FEE_PCT_BUFFER = 3

/** Whether spending `balance` of `assetId` must leave the tx fee behind. */
export const useFeeReserveNeed = (assetId: string, balance: string) => {
  const { data: feeAssetId, isLoading } = useAccountFeePaymentAssetId()
  return {
    needsReserve: feeAssetId === Number(assetId) && Big(balance || "0").gt(0),
    isLoading,
  }
}

/**
 * What a form may spend of `balance` (human units). Paying with the fee asset
 * leaves the fee of `reference` (what spending the whole balance signs) and the
 * existential deposit behind, which also stops the chain reassigning the fee
 * asset. While the reference or its estimate loads the max is unresolved, and
 * MAX and submit should wait for it.
 */
export const useFeeReservedBalance = (
  { needsReserve, isLoading }: ReturnType<typeof useFeeReserveNeed>,
  balance: string,
  reference: { tx: AnyTransaction | null | undefined; isError: boolean },
) => {
  const tx = needsReserve ? (reference.tx ?? null) : null
  const { isError: isEstimateError } = useEstimateFee(tx)
  const reserved = useMaxBalanceWithFee(tx, FEE_PCT_BUFFER)

  if (!needsReserve)
    return { maxBalance: balance, isResolved: !isLoading, isError: false }

  return {
    maxBalance: reserved?.maxBalanceHuman ?? balance,
    isResolved: !!reserved,
    isError: reference.isError || isEstimateError,
  }
}
