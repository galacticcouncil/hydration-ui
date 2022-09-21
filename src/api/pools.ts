import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useApiPromise } from "utils/network"
import { ApiPromise } from "@polkadot/api"
import { AccountId32 } from "@polkadot/types/interfaces"
import { useTradeRouter } from "utils/sdk"
import { TradeRouter } from "@galacticcouncil/sdk"

export const usePools = () => {
  const tradeRouter = useTradeRouter()

  return useQuery(QUERY_KEYS.pools, getPools(tradeRouter))
}

export const usePoolShareToken = (poolId: AccountId32 | string) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.poolShareToken(poolId),
    getPoolShareToken(api, poolId),
  )
}

export const getPools = (tradeRouter: TradeRouter) => async () =>
  tradeRouter.getPools()

const getPoolShareToken =
  (api: ApiPromise, poolId: AccountId32 | string) => async () => {
    return await api.query.xyk.shareToken(poolId)
  }
