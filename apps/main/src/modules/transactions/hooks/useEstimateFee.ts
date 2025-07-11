import { isSS58Address, safeStringify } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { getSpotPrice } from "@/api/spotPrice"
import { transformAnyToPapiTx } from "@/modules/transactions/utils/tx"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { Transaction } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useEstimateFee = (transaction: Transaction) => {
  const { papi, sdk, isLoaded } = useRpcProvider()
  const { native, getAsset } = useAssets()
  const { account } = useAccount()

  const feePaymentAssetIdOverride = transaction?.fee?.feePaymentAssetId

  const {
    data: accountFeePaymentAssetId,
    isLoading: isLoadingFeePaymentAssetId,
  } = useAccountFeePaymentAssetId({
    enabled: !feePaymentAssetIdOverride,
  })

  const { isBalanceLoading, getFreeBalance } = useAccountBalances()

  const address = account?.address ?? ""

  const feeAssetId =
    feePaymentAssetIdOverride || accountFeePaymentAssetId?.toString()
  const feeAsset = getAsset(feeAssetId ?? "")

  const tx = transformAnyToPapiTx(papi, transaction.tx)

  return useQuery({
    enabled:
      isLoaded &&
      !isLoadingFeePaymentAssetId &&
      !isBalanceLoading &&
      isSS58Address(address),
    queryKey: ["estimateFee", address, safeStringify(tx?.decodedCall)],
    queryFn: async () => {
      if (!tx) throw new Error("Invalid transaction")
      if (!feeAsset) throw new Error(`Asset ${feeAssetId} is not valid`)

      const getSpotPriceFn = getSpotPrice(
        sdk.api.router,
        native.id,
        feeAsset.id,
      )
      const [fees, spot] = await Promise.all([
        tx.getEstimatedFees(address),
        getSpotPriceFn(),
      ])

      const feeEstimateNative = scaleHuman(fees, native.decimals)

      const feeAssetBalance = scaleHuman(
        getFreeBalance(feeAsset.id),
        feeAsset.decimals,
      )

      if (spot?.spotPrice) {
        const feeEstimate = Big(feeEstimateNative)
          .mul(spot.spotPrice)
          .toString()

        return {
          feeEstimateNative,
          feeEstimate,
          feeAssetBalance,
          feeAssetId,
        }
      }

      const assetPaymentValue =
        await papi.query.MultiTransactionPayment.AcceptedCurrencies.getValue(
          Number(feeAsset.id),
        )

      if (!assetPaymentValue) {
        throw new Error(`Asset ${feeAsset.id} is not accepted for payment`)
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
        feeAssetBalance,
        feeAssetId,
      }
    },
  })
}
