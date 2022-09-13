import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise, WsProvider } from "@polkadot/api"
import * as definitions from "interfaces/voting/definitions"

export const useProvider = () => {
  return useQuery(
    QUERY_KEYS.provider("wss://rpc01.hydration.dev"),
    async ({ queryKey: [_, api] }) => {
      const provider = new WsProvider(api)
      const types = Object.values(definitions).reduce(
        (res, { types }): object => ({ ...res, ...types }),
        {},
      )
      return await ApiPromise.create({ provider, types })
    },
    { staleTime: Infinity },
  )
}
