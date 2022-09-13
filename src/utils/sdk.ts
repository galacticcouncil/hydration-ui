import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "./queryKeys"
import { useApiPromise } from "utils/network"
import { useMemo } from "react"

export const useTradeRouter = () => {
  const api = useApiPromise()
  const sdk = useSdk()

  const router = useMemo(() => {
    if (sdk.data) {
      const poolService = new sdk.data.PolkadotPoolService(api)
      const tradeRouter = new sdk.data.TradeRouter(poolService)

      return tradeRouter
    }
  }, [api, sdk.data])

  return router
}

export const useSdk = () => {
  return useQuery(QUERY_KEYS.sdk, getSdk)
}

export const getSdk = async () => {
  const sdk = await import("@galacticcouncil/sdk")
  return sdk
}
