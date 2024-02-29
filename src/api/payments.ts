import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { SubmittableExtrinsic } from "@polkadot/api/promise/types"
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
import { useSpotPrice } from "./spotPrice"

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

export const useTransactionFeeInfo = (extrinsic: SubmittableExtrinsic) => {
  const { assets } = useRpcProvider()
  const { account } = useAccount()

  const accountCurrency = useAccountCurrency(account?.address)
  const paymentInfo = usePaymentInfo(extrinsic)

  const currencyMeta = accountCurrency.data
    ? assets.getAsset(accountCurrency.data)
    : undefined

  const spotPrice = useSpotPrice(assets.native.id, currencyMeta?.id)

  const fee = paymentInfo.data
    ? paymentInfo.data.partialFee
        .toBigNumber()
        .shiftedBy(-assets.native.decimals)
        .times(spotPrice.data?.spotPrice ?? 1)
    : undefined

  return {
    isLoading:
      accountCurrency.isInitialLoading ||
      paymentInfo.isInitialLoading ||
      spotPrice.isInitialLoading,
    fee,
    feeSymbol: currencyMeta?.symbol,
  }
}
