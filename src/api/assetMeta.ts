import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32, u8 } from "@polkadot/types"
import { isApiLoaded, Maybe } from "utils/helpers"
import { getApiIds } from "./consts"
import { STABLEPOOL_TOKEN_DECIMALS } from "utils/constants"
import BigNumber from "bignumber.js"

export const useAssetMeta = (id: Maybe<u32 | string>) => {
  const api = useApiPromise()

  return useQuery(QUERY_KEYS.assetsMeta, getAllAssetMeta(api), {
    enabled: !!id,
    select: (data) => {
      // TODO: Temporary workaround. Fetch asset details, based on type if stableswap then decimals === constant
      if (id?.toString() === "123") {
        return {
          id: id.toString(),
          symbol: "SPS",
          decimals: new BigNumber(STABLEPOOL_TOKEN_DECIMALS),
        }
      }

      return data.find((i) => i.id === id?.toString())
    },
  })
}

export const useAssetMetaList = (ids: Array<Maybe<u32 | string>>) => {
  const api = useApiPromise()

  const normalizedIds = ids
    .filter((x): x is u32 | string => !!x)
    .map((i) => i?.toString())

  return useQuery(QUERY_KEYS.assetsMeta, getAllAssetMeta(api), {
    enabled: !!isApiLoaded(api),
    select: (data) => {
      const d = data.filter((i) => normalizedIds.includes(i.id))

      if (normalizedIds.includes("123")) {
        return [
          ...d,
          // TODO: Temporary workaround. Fetch asset details, based on type if stableswap then decimals === constant
          {
            id: "123",
            symbol: "SPS",
            decimals: {
              toString: () => STABLEPOOL_TOKEN_DECIMALS,
              toNumber: () => STABLEPOOL_TOKEN_DECIMALS,
              toBigNumber: () => STABLEPOOL_TOKEN_DECIMALS,
            },
          },
        ]
      }

      return d
    },
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
    enabled: !!isApiLoaded(api),
  })
}
