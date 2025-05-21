import { isSS58Address, safeStringify } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { getSpotPrice } from "@/api/spotPrice"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { AnyTransaction } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

type UseEstimateFeeProps = {
  address: string
  tx: AnyTransaction
  feePaymentAssetId?: string
}

type UseEstimateFeeResult = {
  feeEstimateNative: string
  feeEstimate: string
  feeAssetId: string
}

export const useEstimateFee = ({
  address,
  tx: _tx,
  feePaymentAssetId,
}: UseEstimateFeeProps) => {
  const { papi, tradeRouter, isLoaded } = useRpcProvider()
  const { native, getAssetWithFallback } = useAssets()

  const {
    data: accountFeePaymentAssetId,
    isLoading: isLoadingFeePaymentAssetId,
  } = useAccountFeePaymentAssetId()

  const tx = isPapiTransaction(_tx) ? _tx : null

  const feeAssetId = feePaymentAssetId || accountFeePaymentAssetId?.toString()

  return useQuery<UseEstimateFeeResult>({
    enabled:
      isLoaded && !isLoadingFeePaymentAssetId && !!tx && isSS58Address(address),
    queryKey: ["estimateFee", address, safeStringify(tx?.decodedCall)],
    queryFn: async () => {
      if (!tx) throw new Error("Invalid transaction")
      if (!feeAssetId) throw new Error("Missing fee payment asset id")

      const fees = await tx.getEstimatedFees(address)
      const feeEstimateNative = scaleHuman(fees, native.decimals)

      const spot = await getSpotPrice(tradeRouter, native.id, feeAssetId)()

      if (spot?.spotPrice) {
        const feeEstimate = Big(feeEstimateNative)
          .mul(spot.spotPrice ?? 1)
          .toString()

        return {
          feeEstimateNative,
          feeEstimate,
          feeAssetId,
        }
      }

      const assetPaymentValue =
        await papi.query.MultiTransactionPayment.AcceptedCurrencies.getValue(
          Number(feeAssetId),
        )

      if (!assetPaymentValue) {
        throw new Error("Asset is not valid fee payment asset")
      }

      const feeAsset = getAssetWithFallback(feeAssetId)
      const assetPaymentValueAdjusted = scaleHuman(
        assetPaymentValue,
        feeAsset.decimals,
      )

      const feeEstimate = Big(1)
        .div(assetPaymentValueAdjusted)
        .mul(feeEstimateNative)
        .toString()

      return {
        feeEstimateNative,
        feeEstimate,
        feeAssetId,
      }
    },
  })
}
