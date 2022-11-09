import { NATIVE_ASSET_ID, useApiPromise } from "utils/api"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { ApiPromise } from "@polkadot/api"
import { u32 } from "@polkadot/types"
import { Maybe } from "utils/helpers"
import { useAccountBalances } from "./accountBalances"
import { AccountId32 } from "@polkadot/types/interfaces"

export const useAssetDetails = (id: Maybe<u32 | string>) => {
  const api = useApiPromise()
  return useQuery(QUERY_KEYS.assets, getAssetDetails(api), {
    select: (data) => data.find((i) => i.id === id?.toString()),
  })
}

export const useAssetDetailsList = (ids?: Maybe<u32 | string>[]) => {
  const api = useApiPromise()

  const normalizedIds = ids?.reduce<string[]>((memo, item) => {
    if (item != null) memo.push(item.toString())
    return memo
  }, [])

  return useQuery(QUERY_KEYS.assets, getAssetDetails(api), {
    select: (data) => {
      return normalizedIds != null
        ? data.filter((i) => normalizedIds?.includes(i.id))
        : data
    },
  })
}

export const useAssetAccountDetails = (
  address: Maybe<AccountId32 | string>,
) => {
  const accountBalances = useAccountBalances(address)

  const ids = accountBalances.data?.balances
    ? [NATIVE_ASSET_ID, ...accountBalances.data.balances.map((b) => b.id)]
    : []

  return useAssetDetailsList(ids)
}

const getAssetDetails = (api: ApiPromise) => async () => {
  const [system, entries] = await Promise.all([
    api.rpc.system.properties(),
    api.query.assetRegistry.assets.entries(),
  ])

  const assets = entries
    .filter(([_, data]) => data.unwrap().assetType.isToken)
    .map(([key, data]) => {
      return {
        id: key.args[0].toString(),
        name: data.unwrap().name.toUtf8(),
        locked: data.unwrap().locked.toPrimitive(),
      }
    })

  if (!assets.find((i) => i.id === NATIVE_ASSET_ID)) {
    assets.push({
      id: NATIVE_ASSET_ID,
      locked: false,
      name: system.tokenSymbol.unwrap()[0].toString(),
    })
  }

  return assets
}
