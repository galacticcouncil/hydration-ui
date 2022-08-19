import { GlobalStyle } from "./GlobalStyle"

import { ApiPromise, WsProvider } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { LoadingPage } from "pages/LoadingPage/LoadingPage"
import { ApiPromiseContext } from "utils/network"
import { FarmsPoolsPage } from "pages/FarmsPoolsPage/FarmsPoolsPage"

export const App = () => {
  const api = useQuery(
    ["provider", "wss://rpc-01.basilisk-rococo.hydradx.io"],
    async ({ queryKey: [_, api] }) => {
      const provider = new WsProvider(api)
      return await ApiPromise.create({ provider })
    },
    { staleTime: Infinity },
  )

  return (
    <>
      <GlobalStyle />
      {api.data ? (
        <ApiPromiseContext.Provider value={api.data}>
          <FarmsPoolsPage />
        </ApiPromiseContext.Provider>
      ) : (
        <LoadingPage />
      )}
    </>
  )
}
