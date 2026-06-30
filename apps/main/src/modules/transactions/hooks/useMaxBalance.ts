import { useAccountFeePaymentAssetId } from "@/api/payments"
import { useMaxBalanceWithFee } from "@/modules/transactions/hooks/useMaxBalanceWithFee"
import { AnyTransaction } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

export const useMaxBalance = ({
  assetId,
  tx,
  feePctBuffer,
  balance,
}: {
  assetId?: string
  tx: AnyTransaction | null
  balance?: string
  feePctBuffer?: number
}) => {
  const { data: accountFeePaymentAssetId } = useAccountFeePaymentAssetId()
  const { getAssetWithFallback } = useAssets()
  const { getTransferableBalance } = useAccountBalances()

  const isFeePaymentAsset = assetId
    ? accountFeePaymentAssetId === Number(assetId)
    : false

  const maxBalanceWithFee = useMaxBalanceWithFee(
    isFeePaymentAsset ? tx : null,
    feePctBuffer,
  )

  if (!assetId) {
    return {
      maxBalanceHuman: "0",
    }
  }

  if (!isFeePaymentAsset) {
    return {
      maxBalanceHuman: scaleHuman(
        balance ?? getTransferableBalance(assetId),
        getAssetWithFallback(assetId).decimals,
      ),
    }
  }

  return { maxBalanceHuman: maxBalanceWithFee?.maxBalanceHuman ?? "0" }
}
