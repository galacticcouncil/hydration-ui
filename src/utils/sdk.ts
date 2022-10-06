import { useApiPromise } from "utils/network"
import { useMemo } from "react"
import { PolkadotApiPoolService, TradeRouter } from "@galacticcouncil/sdk"

export const useTradeRouter = () => {
  const api = useApiPromise()

  const router = useMemo(() => {
    const poolService = new PolkadotApiPoolService(api)
    const tradeRouter = new TradeRouter(poolService)

    return tradeRouter
  }, [api])

  return router
}
