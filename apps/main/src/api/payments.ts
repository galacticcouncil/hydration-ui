import { DOT_ASSET_ID } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isBigInt, isNumber, pick, prop, unique, zip } from "remeda"
import { useShallow } from "zustand/shallow"

import { UseBaseObservableQueryOptions } from "@/hooks/useObservableQuery"
import { usePapiObservableQuery } from "@/hooks/usePapiObservableQuery"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountData } from "@/states/account"
import { TransactionOptions, useTransactionsStore } from "@/states/transactions"
import { NATIVE_ASSET_ID } from "@/utils/consts"

import { allPools } from "./pools"

const isCurrencyAccepted = (asset: TAsset, data?: bigint) => {
  // Native asset is always accepted
  if (asset.id === NATIVE_ASSET_ID) return true
  // Disallow all Erc20 assets
  if (asset.type === "Erc20") return false
  // Allow all other assets with data
  if (isBigInt(data) && data > 0) return true
  return false
}

export const useAcceptedFeePaymentAssets = (ids: string[]) => {
  const { papi, isLoaded, sdk } = useRpcProvider()
  const queryClient = useQueryClient()
  const { getAsset } = useAssets()

  return useQuery({
    enabled: isLoaded && ids.length > 0,
    queryKey: ["acceptedCurrencies", ids],
    queryFn: async () => {
      const assetIds = ids.map<[number]>((id) => [Number(id)])

      const [pools, acceptedCurrencies] = await Promise.all([
        queryClient.ensureQueryData(allPools(sdk)),
        papi.query.MultiTransactionPayment.AcceptedCurrencies.getValues(
          assetIds,
        ),
      ])

      const entries = zip(ids, acceptedCurrencies)

      return entries.reduce((acc, [id, data]) => {
        const asset = getAsset(id)

        if (!asset) return acc

        const isAccepted = isCurrencyAccepted(asset, data)

        if (isAccepted) {
          acc.push(asset)
          return acc
        }

        const hasPoolWithDOT = !!pools.allPools.find(
          (pool) =>
            pool.tokens.find((token) => token.id === Number(asset.id)) &&
            pool.tokens.find((token) => token.id === Number(DOT_ASSET_ID)),
        )

        if (hasPoolWithDOT) {
          acc.push(asset)
          return acc
        }

        return acc
      }, [] as TAsset[])
    },
  })
}

export const useAccountFeePaymentAssetId = (
  options?: UseBaseObservableQueryOptions,
) => {
  const { isConnected, account } = useAccount()
  const address = isConnected ? account.address : ""

  return usePapiObservableQuery(
    "MultiTransactionPayment.AccountCurrencyMap",
    [address, "best"],
    {
      select: (assetId) => assetId || Number(NATIVE_ASSET_ID),
      ...options,
    },
  )
}

export const useAccountFeePaymentAssets = () => {
  const { getAsset } = useAssets()

  const { balances, isBalanceLoading } = useAccountData(
    useShallow(pick(["balances", "isBalanceLoading"])),
  )
  const { data: accountFeePaymentAssetId, isLoading: isPaymentAssetLoading } =
    useAccountFeePaymentAssetId()

  const allowedFeePaymentAssetIds = useMemo<string[]>(() => {
    if (
      isBalanceLoading ||
      isPaymentAssetLoading ||
      !isNumber(accountFeePaymentAssetId)
    )
      return []

    const assetIds = Object.keys(balances)
    return unique([...assetIds, accountFeePaymentAssetId.toString()])
  }, [
    accountFeePaymentAssetId,
    balances,
    isPaymentAssetLoading,
    isBalanceLoading,
  ])

  const {
    data: acceptedFeePaymentAssets,
    isLoading: isAcceptedFeePaymentAssetsLoading,
  } = useAcceptedFeePaymentAssets(allowedFeePaymentAssetIds)

  const isLoading =
    isBalanceLoading ||
    isPaymentAssetLoading ||
    isAcceptedFeePaymentAssetsLoading

  const acceptedFeePaymentAssetsIds = useMemo(() => {
    if (!acceptedFeePaymentAssets) return []
    return acceptedFeePaymentAssets.map(prop("id"))
  }, [acceptedFeePaymentAssets])

  const accountFeePaymentAsset = isNumber(accountFeePaymentAssetId)
    ? getAsset(accountFeePaymentAssetId.toString())
    : undefined

  return {
    isLoading,
    accountFeePaymentAsset,
    accountFeePaymentAssetId,
    acceptedFeePaymentAssets,
    acceptedFeePaymentAssetsIds,
  }
}

export const useSetFeePaymentAsset = (options: TransactionOptions) => {
  const { t } = useTranslation(["common"])
  const { papi } = useRpcProvider()
  const { createTransaction } = useTransactionsStore()
  const { getAssetWithFallback } = useAssets()

  return useMutation({
    mutationFn: async (assetId: string) => {
      const { symbol } = getAssetWithFallback(assetId)
      return createTransaction(
        {
          tx: papi.tx.MultiTransactionPayment.set_currency({
            currency: Number(assetId),
          }),
          fee: {
            feePaymentAssetId: assetId,
          },
          toasts: {
            submitted: t("payment.toast.onLoading", {
              symbol,
            }),
            success: t("payment.toast.onSuccess", {
              symbol,
            }),
            error: t("payment.toast.onLoading", {
              symbol,
            }),
          },
        },
        options,
      )
    },
  })
}
