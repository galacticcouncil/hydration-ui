import { isSS58Address, safeStringify } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { getSpotPrice } from "@/api/spotPrice"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { AnyPapiTx } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

type UseEstimateFeeProps = {
  tx?: AnyPapiTx
  address: string
  feePaymentAssetId?: string
}

export const useEstimateFee = ({
  tx,
  address,
  feePaymentAssetId,
}: UseEstimateFeeProps) => {
  const { papi, tradeRouter, isLoaded } = useRpcProvider()
  const { native, getAsset } = useAssets()

  const {
    data: accountFeePaymentAssetId,
    isLoading: isLoadingFeePaymentAssetId,
  } = useAccountFeePaymentAssetId({
    enabled: !feePaymentAssetId,
  })

  const feeAssetId = feePaymentAssetId || accountFeePaymentAssetId?.toString()

  return useQuery({
    enabled: isLoaded && !isLoadingFeePaymentAssetId && isSS58Address(address),
    queryKey: ["estimateFee", address, safeStringify(tx?.decodedCall)],
    queryFn: async () => {
      if (!tx) throw new Error("Invalid transaction")
      if (!feeAssetId) throw new Error("Missing fee payment asset id")

      const getSpotPriceFn = getSpotPrice(tradeRouter, native.id, feeAssetId)
      const [fees, spot] = await Promise.all([
        tx.getEstimatedFees(address),
        getSpotPriceFn(),
      ])

      const feeEstimateNative = scaleHuman(fees, native.decimals)

      if (spot?.spotPrice) {
        const feeEstimate = Big(feeEstimateNative)
          .mul(spot.spotPrice)
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

      const feeAsset = getAsset(feeAssetId)

      if (!assetPaymentValue || !feeAsset) {
        throw new Error(`Asset ${feeAssetId} is not valid fee payment asset`)
      }

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
