import BN from "bignumber.js"
import { ApiPromise } from "@polkadot/api"
import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop, normalizeId } from "utils/helpers"
import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { ToastMessage, useAccountStore, useStore } from "state/store"
import { u32 } from "@polkadot/types-codec"
import { AccountId32 } from "@open-web3/orml-types/interfaces"
import { usePaymentInfo } from "./transaction"

const getAcceptedCurrency = (api: ApiPromise, id: u32 | string) => async () => {
  const normalizedId = normalizeId(id)
  const result = await api.query.multiTransactionPayment.acceptedCurrencies(
    normalizedId,
  )

  return {
    id: normalizedId,
    accepted: !result.isEmpty,
  }
}

export const useAcceptedCurrencies = (ids: Maybe<string | u32>[]) => {
  const api = useApiPromise()

  return useQueries({
    queries: ids.map((id) => ({
      queryKey: QUERY_KEYS.acceptedCurrencies(id),
      queryFn: !!api && !!id ? getAcceptedCurrency(api, id) : undefinedNoop,
      enabled: !!api && !!id,
    })),
  })
}

export const useSetAsFeePayment = () => {
  const api = useApiPromise()
  const { account } = useAccountStore()
  const { createTransaction } = useStore()
  const queryClient = useQueryClient()
  const { data: paymentInfoData } = usePaymentInfo(
    api?.tx.balances.transferKeepAlive("", "0"),
  )

  return async (tokenId?: string, toast?: ToastMessage) => {
    if (!(api && tokenId && paymentInfoData)) return

    const transaction = await createTransaction(
      {
        tx: api.tx.multiTransactionPayment.setCurrency(tokenId),
        overrides: {
          fee: new BN(paymentInfoData.partialFee.toHex()),
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

const getAccountCurrency =
  (api: ApiPromise, address: string | AccountId32) => async () => {
    const result = await api.query.multiTransactionPayment.accountCurrencyMap(
      address,
    )

    if (!result.isEmpty) {
      return result.toString()
    }

    return NATIVE_ASSET_ID
  }

export const useAccountCurrency = (address: Maybe<string | AccountId32>) => {
  const api = useApiPromise()
  return useQuery(
    QUERY_KEYS.accountCurrency(address),
    !!api && !!address ? getAccountCurrency(api, address) : undefinedNoop,
    { enabled: !!api && !!address },
  )
}
