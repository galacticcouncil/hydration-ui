import { ApiPromise } from "@polkadot/api"
import { useQuery } from "@tanstack/react-query"
import { useRpcProvider } from "providers/rpcProvider"
import { QUERY_KEYS } from "utils/queryKeys"

const getXYKPools = (api: ApiPromise) => async () => {
  const res = await api.query.xyk.poolAssets.entries()

  const data = res.map(([key, codec]) => {
    const poolAddress = key.args[0].toString()
    //@ts-ignore
    const assets: string[] = codec.unwrap()?.map((el) => el.toString())
    return { poolAddress, assets }
  })

  return data
}

export const useGetXYKPools = () => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.xykPools, getXYKPools(api))
}

const getShareTokens = (api: ApiPromise) => async () => {
  const res = await api.query.xyk.shareToken.entries()

  const data = res.map(([key, shareTokenIdRaw]) => {
    const poolAddress = key.args[0].toString()
    const shareTokenId = shareTokenIdRaw.toString()
    return { poolAddress, shareTokenId }
  })

  return data
}

export const useShareTokens = () => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.shareTokens, getShareTokens(api))
}

export const useXYKConsts = () => {
  const { api } = useRpcProvider()

  return useQuery(QUERY_KEYS.xykConsts, getXYKConsts(api))
}

const getXYKConsts = (api: ApiPromise) => async () => {
  const res = await api.consts.xyk.getExchangeFee
  //@ts-ignore
  const data = res?.map((el) => el.toString()) as string[]

  return { fee: data }
}
