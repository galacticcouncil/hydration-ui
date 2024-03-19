import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import {
  Maybe,
  undefinedNoop,
  normalizeId,
  isNotNil,
  identity,
} from "utils/helpers"
import { NATIVE_ASSET_ID } from "utils/api"
import { ToastMessage, useStore } from "state/store"
import { u32 } from "@polkadot/types-codec"
import { AccountId32 } from "@open-web3/orml-types/interfaces"
import { usePaymentInfo } from "./transaction"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAcountAssets } from "api/assetDetails"
import { useMemo } from "react"
import { uniqBy } from "utils/rx"
import { NATIVE_EVM_ASSET_ID, isEvmAccount } from "utils/evm"

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
  (api: ApiPromise, address: string | AccountId32) => async () => {
    const result =
      await api.query.multiTransactionPayment.accountCurrencyMap(address)

    if (!result.isEmpty) {
      return result.toString()
    }

    return NATIVE_ASSET_ID
  }

export const useAccountCurrency = (address: Maybe<string | AccountId32>) => {
  const { api, isLoaded } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.accountCurrency(address),
    !!address ? getAccountCurrency(api, address) : undefinedNoop,
    {
      enabled: !!address && isLoaded,
    },
  )
}

export const useAccountFeePaymentAssets = () => {
  const { assets } = useRpcProvider()
  const { account } = useAccount()
  const accountAssets = useAcountAssets(account?.address)
  const accountFeePaymentAsset = useAccountCurrency(account?.address)
  const feePaymentAssetId = accountFeePaymentAsset.data

  const allowedFeePaymentAssetsIds = useMemo(() => {
    if (isEvmAccount(account?.address)) {
      const evmNativeAssetId = assets.getAsset(NATIVE_EVM_ASSET_ID).id
      return uniqBy(
        identity,
        [evmNativeAssetId, feePaymentAssetId].filter(isNotNil),
      )
    }

    const assetIds = accountAssets.map((accountAsset) => accountAsset.asset.id)
    return uniqBy(identity, [...assetIds, feePaymentAssetId].filter(isNotNil))
  }, [assets, account?.address, accountAssets, feePaymentAssetId])

  const acceptedFeePaymentAssets = useAcceptedCurrencies(
    allowedFeePaymentAssetsIds,
  )

  const acceptedFeePaymentAssetsIds = acceptedFeePaymentAssets
    .filter((acceptedFeeAsset) => acceptedFeeAsset?.data?.accepted)
    .map((acceptedFeeAsset) => acceptedFeeAsset?.data?.id)
    .filter(isNotNil)

  const isLoading = acceptedFeePaymentAssets.some((asset) => asset.isLoading)
  const isInitialLoading = acceptedFeePaymentAssets.some(
    (asset) => asset.isInitialLoading,
  )
  const isSuccess = acceptedFeePaymentAssets.every((asset) => asset.isSuccess)

  return {
    acceptedFeePaymentAssetsIds,
    acceptedFeePaymentAssets,
    feePaymentAssetId,
    isLoading: isLoading || accountFeePaymentAsset.isLoading,
    isInitialLoading:
      isInitialLoading || accountFeePaymentAsset.isInitialLoading,
    isSuccess: isSuccess && accountFeePaymentAsset.isSuccess,
  }
}
