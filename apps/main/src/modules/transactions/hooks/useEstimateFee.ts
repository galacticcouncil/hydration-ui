import {
  isSS58Address,
  isValidBigSource,
  safeStringify,
} from "@galacticcouncil/utils"
import {
  isEthereumSigner,
  useAccount,
  useWallet,
} from "@galacticcouncil/web3-connect"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { useAccountFeePaymentAssetId } from "@/api/payments"
import { getSpotPrice } from "@/api/spotPrice"
import { AnyTransaction } from "@/modules/transactions/types"
import {
  estimateEvmFee,
  estimatePermitFee,
  isPermitFeeEstimation,
} from "@/modules/transactions/utils/permitFee"
import { isPapiTransaction } from "@/modules/transactions/utils/polkadot"
import {
  containsEvmCall,
  getExtraTxFeeByWeight,
  transformAnyToPapiTx,
} from "@/modules/transactions/utils/tx"
import { isEvmCall } from "@/modules/transactions/utils/xcm"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { scaleHuman } from "@/utils/formatting"

export const useEstimateFee = (
  anyTx: AnyTransaction | null,
  feePaymentAssetIdOverride?: string,
) => {
  const rpc = useRpcProvider()
  const { papi, sdk, isLoaded } = rpc
  const { native, getAsset } = useAssets()
  const { account } = useAccount()
  const wallet = useWallet()

  const {
    data: accountFeePaymentAssetId,
    isLoading: isLoadingFeePaymentAssetId,
  } = useAccountFeePaymentAssetId({
    enabled: !feePaymentAssetIdOverride,
  })

  const { isBalanceLoading, getTransferableBalance } = useAccountBalances()

  const address = account?.address ?? ""

  const feeAssetId =
    feePaymentAssetIdOverride || accountFeePaymentAssetId?.toString()
  const feeAsset = getAsset(feeAssetId ?? "")

  const tx = anyTx ? transformAnyToPapiTx(papi, anyTx) : null

  const isEthereumWallet = isEthereumSigner(wallet?.signer)

  const feeAssetBalance = feeAsset
    ? scaleHuman(getTransferableBalance(feeAsset.id), feeAsset.decimals)
    : "0"

  return useQuery({
    placeholderData: keepPreviousData,
    select: (data) => {
      return {
        ...data,
        feeAssetBalance,
      }
    },
    enabled:
      isLoaded &&
      !!anyTx &&
      !!feeAsset &&
      !isLoadingFeePaymentAssetId &&
      !isBalanceLoading &&
      isSS58Address(address),
    queryKey: [
      "estimateFee",
      feeAssetId,
      address,
      safeStringify(tx?.decodedCall),
    ],
    queryFn: async () => {
      if (!anyTx) throw new Error("Invalid transaction")
      if (!feeAsset) throw new Error(`Asset ${feeAssetId} is not valid`)

      if (isEthereumWallet) {
        if (isPermitFeeEstimation(feeAssetId ?? "")) {
          try {
            return await estimatePermitFee(
              rpc,
              address,
              anyTx,
              feeAsset,
              native,
            )
          } catch {
            // Fall back to substrate-only estimate for PAPI txs if EVM simulation fails.
            if (!isPapiTransaction(anyTx))
              throw new Error("Permit fee estimation failed")
          }
        }

        return estimateEvmFee(rpc, address, anyTx, feeAsset, native)
      }

      if (!tx) throw new Error("Invalid transaction")
      const hasEvmCall = isEvmCall(anyTx) || containsEvmCall(anyTx)

      const getSpotPriceFn = getSpotPrice(
        sdk.api.router,
        native.id,
        feeAsset.id,
      )

      const [fees, spot, extraFee] = await Promise.all([
        tx.getEstimatedFees(address),
        getSpotPriceFn(),
        hasEvmCall ? getExtraTxFeeByWeight(rpc, address, tx, native.id) : null,
      ])

      const feeEstimateNativeBase = scaleHuman(fees, native.decimals)
      const feeEstimateNative = isValidBigSource(extraFee)
        ? Big(extraFee).add(feeEstimateNativeBase).toFixed(native.decimals)
        : feeEstimateNativeBase

      if (spot?.spotPrice) {
        const feeEstimate = Big(feeEstimateNative)
          .mul(spot.spotPrice)
          .toFixed(feeAsset.decimals)

        return {
          feeEstimateNative,
          feeEstimate,
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
        .toFixed(feeAsset.decimals)

      return {
        feeEstimateNative,
        feeEstimate,
        feeAssetId,
      }
    },
  })
}
