import { safeConvertAddressSS58 } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { paymentInfoQuery } from "@/api/transaction"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scale, scaleHuman } from "@/utils/formatting"

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

  const normalizedDest = safeConvertAddressSS58(to) ?? to

  const { data, ...query } = useQuery({
    ...paymentInfoQuery(
      useRpcProvider(),
      useAccount().account?.address,
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
