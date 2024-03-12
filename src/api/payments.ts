import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop, normalizeId } from "utils/helpers"
import { NATIVE_ASSET_ID } from "utils/api"
import { ToastMessage, useStore } from "state/store"
import { u32 } from "@polkadot/types-codec"
import { AccountId32 } from "@open-web3/orml-types/interfaces"
import { usePaymentInfo } from "./transaction"
import { useRpcProvider } from "providers/rpcProvider"
import { NATIVE_EVM_ASSET_SYMBOL, isEvmAccount } from "utils/evm"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAcountAssets } from "api/assetDetails"
import { useMemo } from "react"
import { uniqBy } from "utils/rx"

export const getAcceptedCurrency =
  (api: ApiPromise, id: u32 | string) => async () => {
    const normalizedId = normalizeId(id)
    const result =
      await api.query.multiTransactionPayment.acceptedCurrencies(normalizedId)

    return {
      id: normalizedId,
      accepted: normalizedId === NATIVE_ASSET_ID || !result.isEmpty,
      data: result.unwrapOr(null)?.toBigNumber(),
    }
  }

export const useAcceptedCurrencies = (ids: Maybe<string | u32>[]) => {
  const { api } = useRpcProvider()

  return useQueries({
    queries: ids.map((id) => ({
      queryKey: QUERY_KEYS.acceptedCurrencies(id),
      queryFn: !!id ? getAcceptedCurrency(api, id) : undefinedNoop,
      enabled: !!id,
    })),
  })
}

export const useSetAsFeePayment = () => {
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()
  const { data: paymentInfoData } = usePaymentInfo(
    api.tx.balances.transferKeepAlive("", "0"),
  )

  return async (tokenId?: string, toast?: ToastMessage) => {
    if (!(tokenId && paymentInfoData)) return

    const transaction = await createTransaction(
      {
        tx: api.tx.multiTransactionPayment.setCurrency(tokenId),
        overrides: {
          fee: new BigNumber(paymentInfoData.partialFee.toHex()),
          currencyId: tokenId,
        },
      },
      { toast },
    )
    if (transaction.isError) return
    await queryClient.refetchQueries({
      queryKey: QUERY_KEYS.accountCurrency(account?.address),
    })
  }
}

export const getAccountCurrency =
  (
    api: ApiPromise,
    address: string | AccountId32,
    assets: Awaited<ReturnType<typeof useRpcProvider>>["assets"],
  ) =>
  async () => {
    if (typeof address === "string" && isEvmAccount(address)) {
      const asset = assets.all.find(
        ({ symbol }) => symbol === NATIVE_EVM_ASSET_SYMBOL,
      )
      return asset?.id
    }

    const result =
      await api.query.multiTransactionPayment.accountCurrencyMap(address)

    if (!result.isEmpty) {
      return result.toString()
    }

    return NATIVE_ASSET_ID
  }

export const useAccountCurrency = (address: Maybe<string | AccountId32>) => {
  const { api, assets, isLoaded } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.accountCurrency(address),
    !!address ? getAccountCurrency(api, address, assets) : undefinedNoop,
    {
      enabled: !!address && isLoaded,
    },
  )
}

export const useAccountFeePaymentAssets = () => {
  const { account } = useAccount()
  const accountAssets = useAcountAssets(account?.address)
  const accountFeePaymentAsset = useAccountCurrency(account?.address)
  const feePaymentAssetId = accountFeePaymentAsset.data

  const alllowedFeePaymentAssetsIds = useMemo(() => {
    if (isEvmAccount(account?.address)) return [feePaymentAssetId]
    return uniqBy(
      (id) => id,
      [
        ...(accountAssets.map((accountAsset) => accountAsset.asset.id) ?? []),
        feePaymentAssetId,
      ],
    )
  }, [account?.address, accountAssets, feePaymentAssetId])

  const acceptedFeePaymentAssets = useAcceptedCurrencies(
    alllowedFeePaymentAssetsIds,
  )

  const isLoading = acceptedFeePaymentAssets.some((asset) => asset.isLoading)
  const isInitialLoading = acceptedFeePaymentAssets.some(
    (asset) => asset.isInitialLoading,
  )
  const isSuccess = acceptedFeePaymentAssets.every((asset) => asset.isSuccess)

  return {
    acceptedFeePaymentAssets,
    feePaymentAssetId,
    isLoading: isLoading || accountFeePaymentAsset.isLoading,
    isInitialLoading:
      isInitialLoading || accountFeePaymentAsset.isInitialLoading,
    isSuccess: isSuccess && accountFeePaymentAsset.isSuccess,
  }
}
