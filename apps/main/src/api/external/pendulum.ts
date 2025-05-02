import { arrayToMap, isJson } from "@galacticcouncil/utils"
import { ApiPromise } from "@polkadot/api"
import { HydradxRuntimeXcmAssetLocation } from "@polkadot/types/lookup"
import { useQuery } from "@tanstack/react-query"

import { useExternalApi } from "@/api/external"
import { pendulum } from "@/utils/externalAssets"
import { TExternalAsset } from "@/utils/externalAssets"

const getPendulumAssetId = (assetId: string): string | undefined => {
  const id = isJson(assetId) ? JSON.parse(assetId) : assetId

  if (id instanceof Object) {
    const key = Object.keys(id)[0]
    const data = key ? id[key] : undefined

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

const getPedulumAssets = async (api: ApiPromise) => {
  try {
    const dataRaw = await api.query.assetRegistry.metadata?.entries()

    const data = dataRaw?.reduce<
      Array<TExternalAsset & { location: HydradxRuntimeXcmAssetLocation }>
    >((acc, [key, dataRaw]) => {
      const idRaw = key?.args[0]?.toString()

      if (!idRaw) {
        return acc
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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
            decimals: data.decimals.toNumber() as number,
            symbol: data.symbol.toHuman() as string,
            name: data.name.toHuman() as string,
            location: location[`as${type}`] as HydradxRuntimeXcmAssetLocation,
            origin: pendulum.parachainId,
            isWhiteListed: false,
          })
      }

      return acc
    }, [])
    return { data, id: pendulum.parachainId }
    // eslint-disable-next-line no-empty
  } catch (e) {}
}

/**
 * Used for fetching tokens only from Pendulum parachain
 */
export const usePendulumAssetRegistry = (enabled = true) => {
  const { data: api } = useExternalApi("pendulum")

  return useQuery({
    queryKey: ["pendulumAssetRegistry"],
    queryFn: async () => {
      if (!api) throw new Error("Pendulum is not connected")
      const pendulum = await getPedulumAssets(api)
      if (pendulum) {
        return pendulum.data
      }
    },
    enabled: enabled && !!api,
    retry: false,
    refetchOnWindowFocus: false,
    gcTime: 1000 * 60 * 60 * 24, // 24 hours,
    staleTime: 1000 * 60 * 60 * 1, // 1 hour
    select: (data) => arrayToMap("id", data),
  })
}
