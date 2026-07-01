import Big from "big.js"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { AnyTransaction } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

export const useMaxBalanceWithFee = (
  assetId: string,
  tx: AnyTransaction | null,
  maxBalance?: string,
) => {
  const { getAssetWithFallback } = useAssets()
  const { data: accountFeePaymentAssetId } = useAccountFeePaymentAssetId()
  const meta = getAssetWithFallback(assetId)

  const isFeePaymentAssetId = accountFeePaymentAssetId?.toString() === assetId

  const { getTransferableBalance } = useAccountBalances()
  const { data: fee } = useEstimateFee(isFeePaymentAssetId ? tx : null)

  if (isFeePaymentAssetId && fee) {
    return Big(fee.feeAssetBalance)
      .minus(fee.feeEstimate)
      .minus(scaleHuman(meta.existentialDeposit, meta.decimals))
      .toString()
  }

  return Big(
    scaleHuman(maxBalance ?? getTransferableBalance(assetId), meta.decimals),
  ).toString()
}
