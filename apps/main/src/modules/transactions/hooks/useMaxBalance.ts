import { useAccountFeePaymentAssetId } from "@/api/payments"
import { useMaxBalanceWithFee } from "@/modules/transactions/hooks/useMaxBalanceWithFee"
import { AnyTransaction } from "@/modules/transactions/types"
import { TAsset } from "@/providers/assetsProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

export const useMaxBalance = (
  asset: TAsset | null,
  tx: AnyTransaction | null,
  feePctBuffer?: number,
) => {
  const { data: accountFeePaymentAssetId } = useAccountFeePaymentAssetId()
  const { getTransferableBalance } = useAccountBalances()

  const isFeePaymentAsset = asset
    ? accountFeePaymentAssetId === Number(asset.id)
    : false

  const maxBalanceWithFee = useMaxBalanceWithFee(
    isFeePaymentAsset ? tx : null,
    feePctBuffer,
  )

  if (!asset) {
    return {
      maxBalanceHuman: "0",
    }
  }

  if (!isFeePaymentAsset) {
    return {
      maxBalanceHuman: scaleHuman(
        getTransferableBalance(asset.id),
        asset.decimals,
      ),
    }
  }

  return { maxBalanceHuman: maxBalanceWithFee?.maxBalanceHuman ?? "0" }
}
