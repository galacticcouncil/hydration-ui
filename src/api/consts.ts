import { useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import BN from "bignumber.js"
import { MIN_WITHDRAWAL_FEE } from "utils/constants"

export const useApiIds = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.apiIds, getApiIds(api))
}

export const getApiIds = (api: ApiPromise) => async () => {
  const apiIds = await Promise.all([
    api.consts.omnipool.hdxAssetId,
    api.consts.omnipool.hubAssetId,
    api.consts.omnipool.stableCoinAssetId,
    api.consts.omnipool.nftCollectionId,
  ])
  const [nativeId, hubId, usdId, omnipoolCollectionId] = apiIds.map((c) =>
    c.toString(),
  )

  return { nativeId, hubId, usdId, omnipoolCollectionId }
}

export const useTVLCap = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.tvlCap, getTvlCap(api))
}

export const getTvlCap = (api: ApiPromise) => async () => {
  return api.consts.omnipool.tvlCap || (await api.query.omnipool.tvlCap())
}

export const useMinWithdrawalFee = () => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.minWithdrawalFee, getMinWithdrawalFee(api))
}

export const getMinWithdrawalFee = (api: ApiPromise) => async () => {
  const minWithdrawalFee = await api.consts.omnipool.minWithdrawalFee

  return (
    minWithdrawalFee?.toBigNumber().div(1000000) ??
    BN(MIN_WITHDRAWAL_FEE).div(1000000)
  )
}
