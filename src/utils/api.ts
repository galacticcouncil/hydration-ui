import { ApiPromise } from "@polkadot/api"
import { createContext, useContext, useMemo } from "react"
import {
  PolkadotApiPoolService,
  PoolType,
  TradeRouter,
} from "@galacticcouncil/sdk"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { encodeAddress } from "@polkadot/util-crypto"
import { stringToU8a } from "@polkadot/util"

export const HYDRA_ADDRESS_PREFIX = 63
export const NATIVE_ASSET_ID = "0"
export const OMNIPOOL_ACCOUNT_ADDRESS = encodeAddress(
  stringToU8a("modlomnipool".padEnd(32, "\0")),
  HYDRA_ADDRESS_PREFIX,
)
export const DEPOSIT_CLASS_ID = "1" // TODO: replace with constant from api
export const POLKADOT_APP_NAME = "HydraDX"

export const ApiPromiseContext = createContext<ApiPromise | undefined>(
  {} as ApiPromise,
)
export const useApiPromise = () => useContext(ApiPromiseContext)

export const useTradeRouter = () => {
  const api = useApiPromise()

  const router = useMemo(() => {
    if (!api) return

    const poolService = new PolkadotApiPoolService(api)
    const tradeRouter = new TradeRouter(poolService, {
      includeOnly: [PoolType.Omni],
    })

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
