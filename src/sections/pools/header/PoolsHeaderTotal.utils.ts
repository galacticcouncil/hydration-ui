import { useOmnipoolAssets } from "api/omnipool"
import { useTokensBalances } from "api/balances"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useSpotPrices } from "api/spotPrice"
import { useApiIds } from "api/consts"
import { useMemo } from "react"
import { useAssetMetaList } from "api/assetMeta"
import { BN_0, BN_10 } from "utils/constants"

export const useTotalInPools = () => {
  const apiIds = useApiIds()
  const assets = useOmnipoolAssets()
  const metas = useAssetMetaList([
    apiIds.data?.usdId,
    ...(assets.data?.map((a) => a.id) ?? []),
  ])
  const balances = useTokensBalances(
    assets.data?.map((a) => a.id.toString()) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const spotPrices = useSpotPrices(
    assets.data?.map((a) => a.id) ?? [],
    apiIds.data?.usdId,
  )

  const queries = [apiIds, assets, metas, ...balances, ...spotPrices]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (
      !apiIds.data ||
      !assets.data ||
      !metas.data ||
      balances.some((q) => !q.data) ||
      spotPrices.some((q) => !q.data)
    )
      return undefined

    const total = assets.data
      .map((asset) => {
        const id = asset.id.toString()
        const meta = metas.data.find((m) => m.id === id)
        const balance = balances.find((b) => b.data?.assetId.toString() === id)
        const sp = spotPrices.find((sp) => sp.data?.tokenIn === id)

        if (!meta || !balance?.data?.balance || !sp?.data?.spotPrice)
          return BN_0

        const dp = BN_10.pow(meta.decimals.toString())
        const value = balance.data.balance.times(sp?.data?.spotPrice).div(dp)

        return value
      })
      .reduce((acc, curr) => acc.plus(curr), BN_0)

    return total
  }, [apiIds.data, assets.data, metas.data, balances, spotPrices])

  return { data, isLoading }
}

export const useUsersTotalInPools = () => {
  const apiIds = useApiIds()
  const assets = useOmnipoolAssets()
  const metas = useAssetMetaList([
    apiIds.data?.usdId,
    ...(assets.data?.map((a) => a.id) ?? []),
  ])
  const balances = useTokensBalances(
    assets.data?.map((a) => a.id.toString()) ?? [],
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const spotPrices = useSpotPrices(
    assets.data?.map((a) => a.id) ?? [],
    apiIds.data?.usdId,
  )

  const queries = [apiIds, assets, metas, ...balances, ...spotPrices]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (true) return undefined
  }, [])

  return { data, isLoading }
}
