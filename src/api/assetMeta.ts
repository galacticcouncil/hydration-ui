import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32, u8 } from "@polkadot/types"
import { Maybe } from "utils/helpers"
import { getApiIds } from "./consts"

export const useAssetMeta = (id: Maybe<u32 | string>) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.assetsMeta, getAllAssetMeta(api), {
    enabled: !!id,
    select: (data) => data.find((i) => i.id === id?.toString()),
  })
}

export const useAssetMetaList = (ids: Array<Maybe<u32 | string>>) => {
  const api = useApiPromise()

  const normalizedIds = ids
    .filter((x): x is u32 | string => !!x)
    .map((i) => i?.toString())

  return useQuery(QUERY_KEYS.assetsMeta, getAllAssetMeta(api), {
    select: (data) => data.filter((i) => normalizedIds.includes(i.id)),
  })
}

const getAllAssetMeta = (api: ApiPromise) => async () => {
  const entries = await api.query.assetRegistry.assetMetadataMap.entries()

  const result: Array<{ id: string; symbol: string; decimals: u8 | u32 }> =
    entries.map(([key, data]) => {
      return {
        id: key.args[0].toString(),
        symbol: data.unwrap().symbol.toUtf8(),
        decimals: data.unwrap().decimals,
      }
    })

  if (!result.find((i) => i.id === NATIVE_ASSET_ID)) {
    const properties = await api.rpc.system.properties()
    const [decimals] = properties.tokenDecimals.unwrap()
    const [symbol] = properties.tokenSymbol.unwrap()

    result.push({
      id: NATIVE_ASSET_ID,
      symbol: symbol.toString(),
      decimals: decimals,
    })
  }

  return result
}

export const getAssetMeta = (api: ApiPromise, id: u32 | string) => async () => {
  if (id.toString() === NATIVE_ASSET_ID) {
    const properties = await api.rpc.system.properties()

    const decimals = properties.tokenDecimals.unwrap()[0]
    const symbol = properties.tokenSymbol.unwrap()[0]

    return {
      id,
      data: {
        symbol,
        decimals,
      },
    }
  }

  const res = await api.query.assetRegistry.assetMetadataMap(id)
  return {
    id,
    data: {
      symbol: res.unwrap().symbol.toUtf8(),
      decimals: res.unwrap().decimals,
    },
  }
}

export const getLRNAMeta = async (api: ApiPromise) => {
  const apiIds = await getApiIds(api)()
  const hubId = apiIds?.hubId

  return getAssetMeta(api, hubId)()
}

export const useLRNAMeta = () => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.LRNAMeta(), () => getLRNAMeta(api), {
    enabled: !!api,
  })
}
