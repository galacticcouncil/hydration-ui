import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { MIN_WITHDRAWAL_FEE } from "utils/constants"
import { isApiLoaded } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"

export const useApiIds = () => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.apiIds, getApiIds(api), {
    enabled: !!isApiLoaded(api),
  })
}

export const getApiIds = (api: ApiPromise) => async () => {
  const apiIds = await Promise.all([
    api.consts.omnipool.hdxAssetId,
    api.consts.omnipool.hubAssetId,
    api.consts.omnipool.nftCollectionId,
  ])

  const [nativeId, hubId, omnipoolCollectionId] = apiIds.map((c) =>
    c.toString(),
  )

  return {
    nativeId,
    hubId,
    omnipoolCollectionId,
  }
}

export const useTVLCap = () => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.tvlCap, getTvlCap(api))
}

const getTvlCap = (api: ApiPromise) => async () => {
  return await api.query.omnipool.tvlCap()
}

export const useMinWithdrawalFee = () => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.minWithdrawalFee, getMinWithdrawalFee(api))
}

const getMinWithdrawalFee = (api: ApiPromise) => async () => {
  const minWithdrawalFee = await api.consts.omnipool.minWithdrawalFee

  return minWithdrawalFee?.toBigNumber().div(1000000) ?? MIN_WITHDRAWAL_FEE
}

export const useMaxAddLiquidityLimit = () => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.maxAddLiquidityLimit, getMaxAddLiquidityLimit(api))
}

const getMaxAddLiquidityLimit = (api: ApiPromise) => async () => {
  const data =
    await api.consts.circuitBreaker.defaultMaxAddLiquidityLimitPerBlock

  const [n, d] = data.unwrap()
  const minWithdrawalFee = n.toBigNumber().div(d.toNumber())

  return minWithdrawalFee
}
