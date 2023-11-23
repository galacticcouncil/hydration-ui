import { useTokensBalances } from "api/balances"
import { useOmnipoolAssets, useOmnipoolPositions } from "api/omnipool"
import BN from "bignumber.js"
import { useMemo } from "react"
import { HydraPositionsTableData } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions.utils"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { useDisplayPrices } from "utils/displayAsset"
import { isNotNil } from "utils/helpers"
import { useRpcProvider } from "providers/rpcProvider"
import { calculatePositionLiquidity } from "utils/omnipool"
import { useAccountOmnipoolPositions } from "sections/pools/PoolsPage.utils"

export const useOmnipoolPositionsData = () => {
  const { assets } = useRpcProvider()
  const accountPositions = useAccountOmnipoolPositions()
  const positions = useOmnipoolPositions(
    accountPositions.data?.omnipoolNfts.map((nft) => nft.instanceId) ?? [],
  )

  const positionIds =
    positions
      .map((position) => position.data?.assetId.toString())
      .filter(isNotNil) ?? []

  const omnipoolAssets = useOmnipoolAssets()
  const omnipoolBalances = useTokensBalances(
    positionIds,
    OMNIPOOL_ACCOUNT_ADDRESS,
  )
  const spotPrices = useDisplayPrices([assets.hub.id, ...positionIds])

  const queries = [
    omnipoolAssets,
    spotPrices,
    ...positions,
    ...omnipoolBalances,
  ]
  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !omnipoolAssets.data ||
      !spotPrices.data ||
      positions.some((q) => !q.data) ||
      omnipoolBalances.some((q) => !q.data)
    )
      return []

    const rows: HydraPositionsTableData[] = positions
      .map((query) => {
        const position = query.data
        if (!position) return null

        const assetId = position.assetId.toString()
        const meta = assets.getAsset(assetId)
        const lrnaMeta = assets.hub
        const omnipoolAsset = omnipoolAssets.data.find(
          (a) => a.id.toString() === assetId,
        )
        const omnipoolBalance = omnipoolBalances.find(
          (b) => b.data?.assetId.toString() === assetId,
        )

        const symbol = meta.symbol
        const name = meta.name

        const lrnaSp = spotPrices.data?.find(
          (sp) => sp?.tokenIn === lrnaMeta.id,
        )

        const valueSp = spotPrices.data?.find((sp) => sp?.tokenIn === assetId)

        const liquidityValues = calculatePositionLiquidity({
          position,
          omnipoolBalance: omnipoolBalance?.data?.balance ?? BN(0),
          omnipoolHubReserve: omnipoolAsset?.data.hubReserve,
          omnipoolShares: omnipoolAsset?.data.shares,
          lrnaSpotPrice: lrnaSp?.spotPrice ?? BN(0),
          valueSpotPrice: valueSp?.spotPrice ?? BN(0),
          lrnaDecimals: lrnaMeta.decimals,
          assetDecimals: meta.decimals,
        })

        const result = {
          id: position.id.toString(),
          assetId,
          symbol,
          name,
          ...liquidityValues,
        }

        return result
      })
      .filter((x): x is HydraPositionsTableData => x !== null)
      .sort((a, b) => b.valueDisplay.minus(a.valueDisplay).toNumber())

    return rows
  }, [
    omnipoolAssets.data,
    spotPrices.data,
    positions,
    omnipoolBalances,
    assets,
  ])

  return {
    data,
    isLoading,
    isInitialLoading: isLoading,
  }
}
