import { ApiPromise } from "@polkadot/api"
import { useQueries } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Maybe, undefinedNoop } from "utils/helpers"
import { useApiPromise } from "utils/api"
import { useStore } from "state/store"
import { u32 } from "@polkadot/types-codec"
import { normalizeId } from "../utils/assets"

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
      queryKey: QUERY_KEYS.acceptedCurrency(id),
      queryFn: !!id ? getAcceptedCurrency(api, id) : undefinedNoop,
      enabled: !!id,
    })),
  })
}

export const useSetAsFeePayment = () => {
  const api = useApiPromise()
  const { createTransaction } = useStore()

  return (tokenId?: string) => {
    if (!tokenId) {
      undefinedNoop()
    } else {
      createTransaction({
        tx: api.tx.multiTransactionPayment.setCurrency(tokenId),
      })
    }
  }
}
