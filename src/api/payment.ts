import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "../utils/queryKeys"
import { Maybe, undefinedNoop } from "../utils/helpers"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useApiPromise } from "../utils/api"

const getAcceptedCurrencies = (api: ApiPromise, address: AccountId32 | string) => {
  return api.query.multiTransactionPayment.acceptedCurrencies(address)
}

export const useAcceptedCurrencies = (address: Maybe<AccountId32 | string>) => {

  const api = useApiPromise()

  return useQuery(QUERY_KEYS.acceptedCurrencies(address), async () =>
    !!address ? await getAcceptedCurrencies(api, address) : undefinedNoop,
    {
      enabled: !!address,
    }
  )

}
