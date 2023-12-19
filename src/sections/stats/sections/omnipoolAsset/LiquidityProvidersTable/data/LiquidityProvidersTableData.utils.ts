import { useTokenBalance } from "api/balances"
import { useApiIds } from "api/consts"
import { useOmnipoolAsset, useOmnipoolPositionsMulti } from "api/omnipool"
import { useTVL } from "api/stats"
import { useUniquesAssets } from "api/uniques"
import BN from "bignumber.js"
import { useRpcProvider } from "providers/rpcProvider"
import { useMemo } from "react"
import { OMNIPOOL_ACCOUNT_ADDRESS } from "utils/api"
import { BN_NAN } from "utils/constants"
import { useDisplayPrices } from "utils/displayAsset"
import { calculatePositionLiquidity } from "utils/omnipool"
import { groupBy } from "utils/rx"

const withoutRefresh = true

const rowLimit = 10

export const useLiquidityProvidersTableData = (assetId: string) => {
  const { assets } = useRpcProvider()

  const apiIds = useApiIds()
  const uniques = useUniquesAssets(
    apiIds.data?.omnipoolCollectionId ?? "",
    withoutRefresh,
  )

  const itemIds = uniques.data?.map((u) => u.itemId) ?? []
  const positions = useOmnipoolPositionsMulti(itemIds, withoutRefresh)

  const omnipoolAsset = useOmnipoolAsset(assetId)
  const assetBalance = useTokenBalance(assetId, OMNIPOOL_ACCOUNT_ADDRESS)

  const spotPrices = useDisplayPrices([apiIds.data?.hubId ?? "", assetId])

  const tvl = useTVL(assetId)

  const queries = [
    uniques,
    positions,
    omnipoolAsset,
    spotPrices,
    assetBalance,
    tvl,
  ]

  const isLoading = queries.some((q) => q.isLoading)

  const data = useMemo(() => {
    if (
      !apiIds.data ||
      !positions.data ||
      !omnipoolAsset.data ||
      !spotPrices.data ||
      !assetBalance.data
    ) {
      return []
    }

    const lrnaId = apiIds.data.hubId

    const meta = assets.getAsset(assetId)
    const lrnaMeta = assets.getAsset(lrnaId)

    const lrnaSp = spotPrices?.data?.find((sp) => sp?.tokenIn === lrnaId)
    const lrnaSpotPrice = lrnaSp?.spotPrice ?? BN(0)

    const valueSp = spotPrices?.data?.find((sp) => sp?.tokenIn === assetId)
    const valueSpotPrice = valueSp?.spotPrice ?? BN(0)

    const balance = assetBalance?.data?.balance ?? BN(0)

    const omnipoolTvlPrice = BN(tvl.data?.[0].tvl_usd ?? BN_NAN)

    const data = positions.data
      // zip positions with uniques by index
      .map((position, index) => {
        const unique = uniques.data?.[index]

        return {
          position,
          unique,
        }
      })
      // filter positions by assetId
      .filter(({ position }) => position.assetId.toString() === assetId)
      .map(({ position, unique }) => {
        const { lrna, value, valueDisplay, valueDisplayWithoutLrna } =
          calculatePositionLiquidity({
            position,
            omnipoolBalance: balance,
            omnipoolHubReserve: omnipoolAsset?.data?.hubReserve,
            omnipoolShares: omnipoolAsset?.data?.shares,
            lrnaSpotPrice,
            valueSpotPrice,
            lrnaDecimals: lrnaMeta.decimals,
            assetDecimals: meta.decimals,
          })

        return {
          assetId: meta.id,
          symbol: meta.symbol,
          account: (unique?.data.owner.toString() ?? "") as string,
          sharePercent: valueDisplayWithoutLrna
            .div(omnipoolTvlPrice)
            .times(100),
          lrna,
          value,
          valueDisplay,
        }
      })

    // group by account
    const groupedData = groupBy(data, (p) => p.account.toString())

    // sum up values for each account
    const summedUpData = Object.values(groupedData).map((positions) =>
      positions.reduce(
        (prev, curr) => {
          const lrna = prev.lrna.plus(curr.lrna)
          const value = prev.value.plus(curr.value)
          const valueDisplay = prev.valueDisplay.plus(curr.valueDisplay)
          const sharePercent = prev.sharePercent.plus(curr.sharePercent)

          return {
            ...prev,
            ...curr,
            lrna,
            value,
            valueDisplay,
            sharePercent,
          }
        },
        {
          assetId: "",
          symbol: "",
          account: "",
          lrna: BN(0),
          value: BN(0),
          valueDisplay: BN(0),
          sharePercent: BN(0),
        },
      ),
    )

    // sort by USD value
    const sortedData = [...summedUpData].sort((a, b) => {
      return b.valueDisplay.minus(a.valueDisplay).toNumber()
    })

    return sortedData.slice(0, rowLimit)
  }, [
    apiIds.data,
    assetBalance.data,
    assetId,
    assets,
    omnipoolAsset.data,
    positions.data,
    spotPrices.data,
    tvl,
    uniques.data,
  ])

  return { isLoading, data }
}

export type TLiquidityProvidersTableData = ReturnType<
  typeof useLiquidityProvidersTableData
>["data"]
