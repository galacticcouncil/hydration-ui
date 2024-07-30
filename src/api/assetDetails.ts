import { AccountId32 } from "@polkadot/types/interfaces"
import { Maybe } from "utils/helpers"
import { useAccountBalances } from "./accountBalances"
import { useAssets } from "providers/assets"
import { useQuery } from "@tanstack/react-query"
import { QUERY_KEYS } from "utils/queryKeys"
import { useActiveRpcUrlList } from "./provider"
import { useRpcProvider } from "providers/rpcProvider"

export const useAcountAssets = (address: Maybe<AccountId32 | string>) => {
  const { getAssetWithFallback, native } = useAssets()
  const accountBalances = useAccountBalances(address, true)

  if (!accountBalances.data) return []

  const tokenBalances = accountBalances.data?.balances
    ? accountBalances.data.balances.map((balance) => {
        const asset = getAssetWithFallback(balance.id)

        return { asset, balance }
      })
    : []
  if (accountBalances.data?.native)
    tokenBalances.unshift({
      balance: accountBalances.data.native,
      asset: native,
    })

  return tokenBalances
}

export const useAssetsLocations = () => {
  const { api, isLoaded } = useRpcProvider()
  const rpcUrlList = useActiveRpcUrlList()

  return useQuery(
    QUERY_KEYS.assetLocations(rpcUrlList.join()),
    async () => {
      const locations = await api.query.assetRegistry.assetLocations.entries()
      return locations.map(
        ([
          {
            args: [id],
          },
          value,
        ]) => ({ data: value.unwrap(), id: id.toString() }),
      )
    },
    { enabled: isLoaded },
  )
}
