import { NATIVE_ASSET_ID, useApiPromise } from "utils/network"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import { Maybe } from "utils/types"
import { undefinedNoop } from "utils/helpers"

export const useAssetDetails = (id: Maybe<u32 | string>) => {
  const api = useApiPromise()

  return useQuery(
    QUERY_KEYS.assetDetails(id?.toString()),
    id != null ? getAssetDetails(api, id) : undefinedNoop,
    { enabled: !!id },
  )
}

export const getAssetDetails =
  (api: ApiPromise, id: u32 | string) => async () => {
    if (id.toString() === NATIVE_ASSET_ID) {
      const properties = await api.rpc.system.properties()
      const symbol = properties.tokenSymbol.unwrap()[0]

      return {
        name: symbol.toHuman(),
        assetType: "Token",
        existentialDeposit: "",
        locked: false,
      }
    }

    const res = await api.query.assetRegistry.assets(id)
    const data = res.toHuman() as {
      name: string
      assetType: "Token" | { PoolShare: string[] }
      existentialDeposit: any
      locked: boolean
    }
    return data
  }
