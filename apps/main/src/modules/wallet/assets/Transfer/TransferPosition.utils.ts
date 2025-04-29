import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { HYDRA_ADDRESS_PREFIX } from "@galacticcouncil/web3-connect/src/constants"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { tokenBalanceQuery } from "@/api/balances"
import { insufficientFeeQuery } from "@/api/constants"
import { paymentInfoQuery } from "@/api/transaction"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scale, scaleHuman } from "@/utils/formatting"

export const useInsufficientTransferFee = (
  assetId: string,
  address: string,
) => {
  const rpc = useRpcProvider()
  const { native, getAssetWithFallback } = useAssets()
  const { isSufficient } = getAssetWithFallback(assetId)

  const validAddress = safeConvertAddressSS58(address)

  const { data: balanceData, isLoading: balanceIsLoading } = useQuery(
    tokenBalanceQuery(rpc, assetId, !isSufficient ? validAddress : null),
  )

  const { data: fee, isLoading: feeIsLoading } = useQuery(
    insufficientFeeQuery(rpc),
  )

  if (isSufficient) {
    return { fee: undefined }
  }

  const isLoading = !rpc.isLoaded || balanceIsLoading || feeIsLoading

  const balance = balanceData?.balance

  if (!balance || new Big(balance).gt(0)) {
    return { fee: undefined }
  }

  return isLoading
    ? { fee: undefined, isLoading }
    : {
        fee: fee
          ? {
              value: fee,
              displayValue: scaleHuman(fee, native.decimals),
              symbol: native.symbol,
            }
          : undefined,
      }
}

export function usePaymentFees({
  asset,
  currentAmount,
  maxAmount,
  to,
}: {
  asset: string | TAsset
  currentAmount: string
  maxAmount: string
  to: string
}) {
  const { data: currentFee } = useTransferPaymentInfo(asset, to, currentAmount)
  const { data: maxFee } = useTransferPaymentInfo(asset, to, maxAmount)

  return {
    currentFee,
    maxFee,
  }
}

export const useTransferPaymentInfo = (
  asset: string | TAsset,
  to: string,
  amount: string,
) => {
  const { native, getAsset } = useAssets()
  const { papi } = useRpcProvider()

  const [assetId, assetDecimals] =
    typeof asset === "string"
      ? [asset, getAsset(asset)?.decimals]
      : [asset.id, asset.decimals]

  const amountScaled = assetDecimals
    ? BigInt(scale(amount, assetDecimals))
    : null

  const normalizedDest = safeConvertAddressSS58(to, HYDRA_ADDRESS_PREFIX) ?? to

  const { data, ...query } = useQuery({
    ...paymentInfoQuery(
      useRpcProvider(),
      useAccount().account?.address,
      to,
      amount,
      assetId,
      assetId === native.id
        ? papi.tx.Currencies.transfer({
            currency_id: Number(native.id),
            dest: normalizedDest,
            amount: amountScaled ?? 0n,
          })
        : papi.tx.Tokens.transfer({
            currency_id: Number(assetId),
            dest: normalizedDest,
            amount: amountScaled ?? 0n,
          }),
    ),
    enabled: !!amountScaled,
  })

  return {
    ...query,
    data:
      data && assetDecimals
        ? scaleHuman(data.partial_fee.toString(), assetDecimals)
        : undefined,
  }
}
