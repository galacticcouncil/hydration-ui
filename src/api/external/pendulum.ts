import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { Parachain } from "@galacticcouncil/xcm-core"
import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { isJson } from "utils/helpers"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { useExternalAssetsMetadata } from "state/store"
import { ApiPromise, WsProvider } from "@polkadot/api"

export const pendulum = chainsMap.get("pendulum") as Parachain

const getPendulumAssetId = (assetId: string) => {
  const id = isJson(assetId) ? JSON.parse(assetId) : assetId

  if (id instanceof Object) {
    const key = Object.keys(id)[0]
    const data = id[key]

    if (key === "stellar") {
      const innerKey = Object.keys(data)[0]
      if (innerKey === "stellarNative") return innerKey

      const idHex = data?.alphaNum4?.code
      return idHex
    } else if (key === "xcm") {
      return undefined
    }
  }

  return undefined
}

export const getPedulumAssets = async () => {
  try {
    const provider = new WsProvider(pendulum.ws)
    const api = await ApiPromise.create({ provider })

    const dataRaw = await api.query.assetRegistry.metadata.entries()

    api.disconnect()

    const data = dataRaw.reduce<
      Array<TExternalAsset & { location: HydradxRuntimeXcmAssetLocation }>
    >((acc, [key, dataRaw]) => {
      const idRaw = key.args[0].toString()

      //@ts-ignore
      const data = dataRaw.unwrap()
      const location = data.location.unwrap()

      if (location) {
        const type = location.type.toString()
        const interior = location[`as${type}`].interior.toString()

        const id = getPendulumAssetId(idRaw)
        if (interior !== "Here" && id)
          acc.push({
            id,
            // @ts-ignore
            decimals: data.decimals.toNumber() as number,
            // @ts-ignore
            symbol: data.symbol.toHuman() as string,
            // @ts-ignore
            name: data.name.toHuman() as string,
            location: location[`as${type}`] as HydradxRuntimeXcmAssetLocation,
            origin: pendulum.parachainId,
            isWhiteListed: false,
          })
      }

      return acc
    }, [])
    return { data, id: pendulum.parachainId }
  } catch (e) {}
}

/**
 * Used for fetching tokens only from Pendulum parachain
 */
export const usePendulumAssetRegistry = (enabled = true) => {
  const { sync } = useExternalAssetsMetadata()

  return useQuery(
    QUERY_KEYS.pendulumAssetRegistry,
    async () => {
      const pendulum = await getPedulumAssets()

      if (pendulum) {
        sync(pendulum.id.toString(), pendulum.data)
        return []
      }
    },
    {
      enabled: enabled,
      retry: false,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * 60 * 24, // 24 hours,
      staleTime: 1000 * 60 * 60 * 1, // 1 hour
      notifyOnChangeProps: [],
    },
  )
}
