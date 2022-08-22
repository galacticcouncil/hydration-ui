import { ApiPromise, WsProvider } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { LoadingPage } from "sections/loading/LoadingPage"
import { ApiPromiseContext } from "utils/network"
import { PoolsPage } from "sections/pools/PoolsPage"

export const App = () => {
  const api = useQuery(
    ["provider", "wss://rpc-01.basilisk-rococo.hydradx.io"],
    async ({ queryKey: [_, api] }) => {
      const provider = new WsProvider(api)
      return await ApiPromise.create({ provider })
    },
    { staleTime: Infinity },
  )

  return api.data ? (
    <ApiPromiseContext.Provider value={api.data}>
      <PoolsPage />
    </ApiPromiseContext.Provider>
  ) : (
    <LoadingPage />
  )
}
