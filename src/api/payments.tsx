import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, isNotNil, identity, undefinedNoop } from "utils/helpers"
import { NATIVE_ASSET_ID } from "utils/api"
import { ToastMessage, useStore } from "state/store"
import { AccountId32 } from "@open-web3/orml-types/interfaces"
import { usePaymentInfo } from "./transaction"
import { useRpcProvider } from "providers/rpcProvider"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useAcountAssets } from "api/assetDetails"
import { useMemo } from "react"
import { uniqBy } from "utils/rx"
import { NATIVE_EVM_ASSET_ID, isEvmAccount } from "utils/evm"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
import { useSpotPrice } from "./spotPrice"
import { BN_1, BN_NAN } from "utils/constants"

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
  const {
    api,
    assets: { native },
  } = useRpcProvider()

  const query = useQuery(
    QUERY_KEYS.acceptedCurrencies,
    getAcceptedCurrency(api),
  )

  const assets = useMemo(() => {
    if (query.data) {
      return ids.map((id) => {
        const response = query.data.find((asset) => asset.id === id)

        return response
          ? response
          : id === native.id
          ? { id, accepted: true, data: undefined }
          : { id, accepted: false, data: undefined }
      })
    }
    return undefined
  }, [ids, native.id, query.data])

  return { ...query, data: assets }
}

export const useSetAsFeePayment = () => {
  const { api } = useRpcProvider()
  const { account } = useAccount()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()
  const { data: paymentInfoData } = usePaymentInfo(
    api.tx.balances.transfer("", "0"),
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
  const { assets, featureFlags } = useRpcProvider()
  const { account } = useAccount()
  const accountAssets = useAcountAssets(account?.address)
  const accountFeePaymentAsset = useAccountCurrency(account?.address)
  const feePaymentAssetId = accountFeePaymentAsset.data

  const allowedFeePaymentAssetsIds = useMemo(() => {
    if (isEvmAccount(account?.address) && !featureFlags.dispatchPermit) {
      const evmNativeAssetId = assets.getAsset(NATIVE_EVM_ASSET_ID).id
      return uniqBy(
        identity,
        [evmNativeAssetId, feePaymentAssetId].filter(isNotNil),
      )
    }

    const assetIds = accountAssets.map((accountAsset) => accountAsset.asset.id)
    return uniqBy(identity, [...assetIds, feePaymentAssetId].filter(isNotNil))
  }, [featureFlags, account?.address, accountAssets, assets, feePaymentAssetId])

  const acceptedFeePaymentAssets = useAcceptedCurrencies(
    allowedFeePaymentAssetsIds,
  )

  const data = acceptedFeePaymentAssets?.data ?? []

  const acceptedFeePaymentAssetsIds = data
    .filter((acceptedFeeAsset) => acceptedFeeAsset?.accepted)
    .map((acceptedFeeAsset) => acceptedFeeAsset?.id)

  const isLoading =
    accountFeePaymentAsset.isLoading || acceptedFeePaymentAssets.isLoading
  const isInitialLoading =
    accountFeePaymentAsset.isInitialLoading ||
    acceptedFeePaymentAssets.isInitialLoading
  const isSuccess =
    accountFeePaymentAsset.isSuccess && acceptedFeePaymentAssets.isSuccess

  return {
    acceptedFeePaymentAssetsIds,
    acceptedFeePaymentAssets,
    feePaymentAssetId,
    isLoading,
    isInitialLoading,
    isSuccess,
  }
}

export const useTransactionFeeInfo = (
  extrinsic: SubmittableExtrinsic,
  customFeeId?: string,
) => {
  const { assets } = useRpcProvider()
  const { account } = useAccount()

  const accountCurrency = useAccountCurrency(account?.address)
  const paymentInfo = usePaymentInfo(extrinsic)

  const currencyMeta = customFeeId
    ? assets.getAsset(customFeeId)
    : accountCurrency.data
    ? assets.getAsset(accountCurrency.data)
    : undefined

  const spotPriceQuery = useSpotPrice(assets.native.id, currencyMeta?.id)

  let spotPrice = spotPriceQuery.data?.spotPrice ?? BN_1

  const nativeFee = paymentInfo.data?.partialFee.toBigNumber()

  const fee = nativeFee
    ? nativeFee.shiftedBy(-assets.native.decimals).times(spotPrice)
    : undefined

  return {
    isLoading:
      accountCurrency.isInitialLoading ||
      paymentInfo.isInitialLoading ||
      spotPriceQuery.isInitialLoading,
    fee,
    feeSymbol: currencyMeta?.symbol,
    nativeFee: nativeFee ?? BN_NAN,
    feeId: currencyMeta?.id,
  }
}
