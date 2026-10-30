import Big from "big.js"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { useDepositReferenceTx } from "@/modules/strategies/propeller/hooks/useVaultWrites"
import { type PropellerDepositOption } from "@/modules/strategies/propeller/utils/depositOptions"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { useMaxBalanceWithFee } from "@/modules/transactions/hooks/useMaxBalanceWithFee"

/** the buffer the liquidity forms use; absorbs a route the reference didn't take */
const FEE_PCT_BUFFER = 3

/**
 * What a deposit may spend. Paying with the fee asset leaves the fee and the
 * existential deposit behind, which also stops the chain reassigning the fee asset.
 */
export const useDepositMaxBalance = (
  deposit: PropellerDepositOption,
  balance: string,
) => {
  const { data: feeAssetId, isLoading: isFeeAssetLoading } =
    useAccountFeePaymentAssetId()
  const paysFee = feeAssetId === Number(deposit.assetId)
  const needsReserve = paysFee && Big(balance || "0").gt(0)

  const { data: referenceTx, isError: isReferenceError } =
    useDepositReferenceTx(deposit, balance, needsReserve)
  const tx = needsReserve ? (referenceTx ?? null) : null
  const { isError: isEstimateError } = useEstimateFee(tx)
  const reserved = useMaxBalanceWithFee(tx, FEE_PCT_BUFFER)

  if (!needsReserve)
    return {
      maxBalance: balance,
      isResolved: !isFeeAssetLoading,
      isError: false,
    }

  return {
    maxBalance: reserved?.maxBalanceHuman ?? balance,
    isResolved: !!reserved,
    isError: isReferenceError || isEstimateError,
  }
}
