import BigNumber from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop } from "utils/helpers"
import { NATIVE_ASSET_ID } from "utils/api"
import { ToastMessage, useStore } from "state/store"
import { AccountId32 } from "@open-web3/orml-types/interfaces"
import { usePaymentInfo } from "./transaction"
import { useRpcProvider } from "providers/rpcProvider"
import { NATIVE_EVM_ASSET_SYMBOL, isEvmAccount } from "utils/evm"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

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

  return useQuery(QUERY_KEYS.acceptedCurrencies, getAcceptedCurrency(api), {
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

export const getNativeEvmAssetId = async (api: ApiPromise) => {
  const assets = await api.query.assetRegistry.assetMetadataMap.entries()
  const weth = assets.find(([_, dataRaw]) => {
    return dataRaw.unwrap().symbol.toUtf8() === NATIVE_EVM_ASSET_SYMBOL
  })

  const assetId = weth?.[0].args[0].toString()

  return assetId
}

export const getAccountCurrency =
  (api: ApiPromise, address: string | AccountId32) => async () => {
    if (typeof address === "string" && isEvmAccount(address)) {
      return await getNativeEvmAssetId(api)
    }

    const result =
      await api.query.multiTransactionPayment.accountCurrencyMap(address)

    if (!result.isEmpty) {
      return result.toString()
    }

    return NATIVE_ASSET_ID
  }

export const useAccountCurrency = (address: Maybe<string | AccountId32>) => {
  const { api } = useRpcProvider()
  return useQuery(
    QUERY_KEYS.accountCurrency(address),
    !!address ? getAccountCurrency(api, address) : undefinedNoop,
    {
      enabled: !!address,
    },
  )
}
