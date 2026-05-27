import Big from "big.js"

import { useEstimateFee } from "@/modules/transactions/hooks/useEstimateFee"
import { AnyTransaction } from "@/modules/transactions/types"
import { useAssets } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const useMaxBalanceWithFee = (tx: AnyTransaction | null) => {
  const { getAssetWithFallback } = useAssets()
  const { data: fee } = useEstimateFee(tx)
  const meta = getAssetWithFallback(fee?.feeAssetId ?? "")

  if (!fee) return undefined

  return {
    maxBalanceHuman: Big.max(
      0,
      Big(fee.feeAssetBalance)
        .minus(fee.feeEstimate)
        .minus(scaleHuman(meta.existentialDeposit, meta.decimals))
        .toString(),
    ),
    ...fee,
  }
}
