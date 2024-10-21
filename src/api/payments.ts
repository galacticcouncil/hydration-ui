import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, isNotNil, identity, undefinedNoop } from "utils/helpers"
import { NATIVE_ASSET_ID } from "utils/api"
import { useStore } from "state/store"
import { AccountId32 } from "@open-web3/orml-types/interfaces"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAssets } from "providers/assets"
import { useMemo } from "react"
import { uniqBy } from "utils/rx"
import { NATIVE_EVM_ASSET_ID, isEvmAccount } from "utils/evm"
import { useAccountAssets } from "./deposits"
import { createToastMessages } from "state/toasts"
import { useTranslation } from "react-i18next"

export const getAcceptedCurrency = (api: ApiPromise) => async () => {
  const dataRaw =
    await api.query.multiTransactionPayment.acceptedCurrencies.entries()

  const data = dataRaw.map(([key, data]) => {
    return {
      id: key.args[0].toString(),
      accepted: !data.isEmpty,
      data: data.unwrapOr(null)?.toBigNumber(),
    }
  })

  return data
}

export const useAcceptedCurrencies = (ids: string[]) => {
  const { api, isLoaded } = useRpcProvider()
  const { native } = useAssets()

  return useQuery(QUERY_KEYS.acceptedCurrencies, getAcceptedCurrency(api), {
    enabled: isLoaded && ids.length > 0,
    select: (assets) => {
      return ids.map((id) => {
        const response = assets.find((asset) => asset.id === id)

        return response
          ? response
          : id === native.id
            ? { id, accepted: true, data: undefined }
            : { id, accepted: false, data: undefined }
      })
    },
  })
}

export const useSetAsFeePayment = () => {
  const { t } = useTranslation()
  const { api } = useRpcProvider()
  const { native, getAsset } = useAssets()
  const { account } = useAccount()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()

  return useMutation(
    async (tokenId?: string) => {
      if (!tokenId) return

      const meta = getAsset(tokenId)

      const toast = createToastMessages(
        "wallet.assets.table.actions.payment.toast",
        {
          t,
          tOptions: {
            asset: meta?.symbol,
          },
          components: ["span", "span.highlight"],
        },
      )

      const paymentInfoData = await api.tx.currencies
        .transfer("", native.id, "0")
        .paymentInfo(account?.address ?? "")

      return await createTransaction(
        {
          tx: api.tx.multiTransactionPayment.setCurrency(tokenId),
          overrides: {
            fee: new BigNumber(paymentInfoData.partialFee.toHex()),
            currencyId: tokenId,
          },
        },
        { toast },
      )
    },
    {
      onSuccess: () =>
        queryClient.refetchQueries({
          queryKey: QUERY_KEYS.accountCurrency(account?.address),
        }),
    },
  )
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
  const { featureFlags } = useRpcProvider()
  const { account } = useAccount()
  const { getAsset } = useAssets()
  const accountAssets = useAccountAssets()
  const accountFeePaymentAsset = useAccountCurrency(account?.address)
  const feePaymentAssetId = accountFeePaymentAsset.data

  const allowedFeePaymentAssetsIds = useMemo(() => {
    if (isEvmAccount(account?.address) && !featureFlags.dispatchPermit) {
      const evmNativeAssetId = getAsset(NATIVE_EVM_ASSET_ID)?.id
      return uniqBy(
        identity,
        [evmNativeAssetId, feePaymentAssetId].filter(isNotNil),
      )
    }

    const assetIds =
      accountAssets.data?.balances.map((balance) => balance.assetId) ?? []
    return uniqBy(identity, [...assetIds, feePaymentAssetId].filter(isNotNil))
  }, [
    account?.address,
    featureFlags.dispatchPermit,
    accountAssets,
    feePaymentAssetId,
    getAsset,
  ])

  const acceptedFeePaymentAssets = useAcceptedCurrencies(
    allowedFeePaymentAssetsIds,
  )

  const data = acceptedFeePaymentAssets?.data ?? []

  const acceptedFeePaymentAssetsIds = data
    .filter((acceptedFeeAsset) => acceptedFeeAsset?.accepted)
    .map((acceptedFeeAsset) => acceptedFeeAsset?.id)

  const isLoading =
    accountFeePaymentAsset.isLoading ||
    acceptedFeePaymentAssets.isLoading ||
    accountAssets.isLoading
  const isInitialLoading =
    accountFeePaymentAsset.isInitialLoading ||
    acceptedFeePaymentAssets.isInitialLoading ||
    accountAssets.isInitialLoading
  const isSuccess =
    accountFeePaymentAsset.isSuccess &&
    acceptedFeePaymentAssets.isSuccess &&
    accountAssets.isSuccess

  return {
    acceptedFeePaymentAssetsIds,
    acceptedFeePaymentAssets,
    feePaymentAssetId,
    isLoading,
    isInitialLoading,
    isSuccess,
  }
}
