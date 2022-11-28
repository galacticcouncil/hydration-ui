import { ApiPromise } from "@polkadot/api"
import { createContext, useContext, useMemo } from "react"
import { PolkadotApiPoolService, TradeRouter } from "@galacticcouncil/sdk"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"

export const HYDRA_ADDRESS_PREFIX = 63
export const NATIVE_ASSET_ID = "0"
export const LRNA_ASSET_ID = "1"
export const OMNIPOOL_POSITION_COLLECTION_ID = "3"
export const DEPOSIT_CLASS_ID = "1" // TODO: replace with constant from api
export const POLKADOT_APP_NAME = "Hydra Web App"

export const ApiPromiseContext = createContext<ApiPromise>({} as ApiPromise)
export const useApiPromise = () => useContext(ApiPromiseContext)

export const useTradeRouter = () => {
  const api = useApiPromise()

  const router = useMemo(() => {
    const poolService = new PolkadotApiPoolService(api)
    const tradeRouter = new TradeRouter(poolService)

    return tradeRouter
  }, [api])

  return router
}

export const getMath = () => async () => {
  const [xyk, lbp, liquidityMining, omnipool] = await Promise.all([
    import("@galacticcouncil/math-xyk"),
    import("@galacticcouncil/math-lbp"),
    import(
      "@galacticcouncil/math/build/liquidity-mining/bundler/hydra_dx_wasm"
    ),
    import("@galacticcouncil/math/build/omnipool/bundler/hydra_dx_wasm"),
  ])

  return {
    xyk,
    lbp,
    liquidityMining,
    omnipool,
  }
}
export const useMath = () => {
  const { data, ...rest } = useQuery(QUERY_KEYS.math, getMath())

  return {
    ...data,
    ...rest,
  }
}
