import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { TAssetData } from "@/api/assets"
import { useXYKPoolsLiquidity } from "@/api/xyk"
import {
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"
import { XYKPoolMeta } from "@/providers/assetsProvider"
import {
  AccountOmnipoolPosition,
  isOmnipoolDepositPosition,
} from "@/states/account"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"
import { numericallyStrDesc } from "@/utils/sort"

export type IsolatedPositionTableData = {
  poolId: string
  joinedFarms: string[]
  shareTokens: string
  shareTokensDisplay: string
  shareTokenId: string
  positionId?: string
  meta: XYKPoolMeta
}

export type BalanceTableData = {
  label: string
  poolId: string
  isStablepoolInOmnipool: boolean
  value: string
  valueDisplay: string | undefined
  meta: TAssetData
  stableswapId: string
}

export type OmnipoolPositionTableData = {
  poolId: string
  joinedFarms: string[]
  isJoinedAllFarms: boolean
  meta: TAssetData
  stableswapId?: string
} & AccountOmnipoolPosition

export const useIsolatedPositions = (pool: IsolatedPoolTable) => {
  const { balance, meta, shareTokenId, positions, id } = pool

  const { data: liquidity } = useXYKPoolsLiquidity(id)

  const price = Big(pool.tvlDisplay)
    .div(liquidity ? scaleHuman(liquidity, pool.meta.decimals) : 1)
    .toString()

  const data = useMemo(() => {
    const freeBalance = Big(scaleHuman(balance ?? 0, meta.decimals))

    let totalBalance = Big(0)
    let totalInFarms = Big(0)
    let totalBalanceDisplay = Big(0)

    const positionsData = positions
      .sort((a, b) => numericallyStrDesc(a.id, b.id))
      .map((position): IsolatedPositionTableData => {
        const joinedFarms = position.yield_farm_entries.map((entry) =>
          entry.global_farm_id.toString(),
        )

        const shareTokens = scaleHuman(position.shares, meta.decimals)
        const shareTokensDisplay = Big(shareTokens).times(price).toString()

        totalInFarms = totalInFarms.plus(shareTokens)

        return {
          poolId: id,
          joinedFarms,
          shareTokens,
          shareTokensDisplay,
          positionId: position.id,
          shareTokenId,
          meta,
        }
      })

    totalBalance = totalBalance.plus(totalInFarms)

    if (freeBalance.gt(0)) {
      const shareTokensDisplay = freeBalance.times(price).toString()

      totalBalance = totalBalance.plus(freeBalance)

      const liquidity = {
        poolId: id,
        joinedFarms: [],
        shareTokens: freeBalance.toString(),
        shareTokensDisplay,
        shareTokenId,
        meta,
      }

      positionsData.push(liquidity)
    }

    totalBalanceDisplay = totalBalance.times(price)

    return {
      positions: positionsData,
      totalBalance: totalBalance.toString(),
      totalInFarms: totalInFarms.toString(),
      totalBalanceDisplay: totalBalanceDisplay.toString(),
    }
  }, [balance, id, meta, positions, price, shareTokenId])

  return data
}

export const useOmnipoolPositions = (pool: OmnipoolAssetTable) => {
  const { t } = useTranslation(["liquidity"])
  const {
    meta,
    positions,
    id,
    stableswapBalance,
    isStablepoolInOmnipool,
    price,
    aStableswapAsset,
    aStableswapBalance,
    allFarms,
    farms,
    stablepoolData,
  } = pool

  const { price: aStableswapPrice, isValid: aStableswapPriceIsValid } =
    useAssetPrice(aStableswapAsset?.id)

  const aStableswapDisplayBalance = useMemo(() => {
    if (!aStableswapBalance || !aStableswapAsset || !aStableswapPriceIsValid)
      return undefined

    return Big(scaleHuman(aStableswapBalance, aStableswapAsset.decimals))
      .times(aStableswapPrice)
      .toString()
  }, [
    aStableswapBalance,
    aStableswapAsset,
    aStableswapPrice,
    aStableswapPriceIsValid,
  ])

  const stableswapId = stablepoolData?.id.toString()

  const stablepoolPosition: BalanceTableData | undefined = useMemo(() => {
    if (!stableswapBalance || !stableswapId) return undefined

    const freeBalance = scaleHuman(stableswapBalance, meta.decimals)

    return {
      meta,
      label: t("liquidity:liquidity.stablepool.position.shares"),
      poolId: id,
      isStablepoolInOmnipool,
      value: freeBalance,
      valueDisplay: price
        ? Big(price).times(freeBalance).toString()
        : undefined,
      stableswapId,
    }
  }, [
    t,
    id,
    isStablepoolInOmnipool,
    stableswapBalance,
    price,
    meta,
    stableswapId,
  ])

  const data = useMemo(() => {
    let totalInFarms = Big(0)
    let totalBalanceDisplay = Big(stablepoolPosition?.valueDisplay ?? 0)

    const positionData = positions
      .sort((a, b) => numericallyStrDesc(a.positionId, b.positionId))
      .map((position): OmnipoolPositionTableData => {
        const joinedFarms: string[] = []
        const farmsToJoin = new Set(farms.map((farm) => farm.globalFarmId))

        if (isOmnipoolDepositPosition(position)) {
          position.yield_farm_entries.forEach((entry) => {
            const farm = allFarms.find(
              (farm) => farm.globalFarmId === entry.global_farm_id,
            )

            farmsToJoin.delete(entry.global_farm_id)

            if (farm) {
              joinedFarms.push(farm.rewardCurrency.toString())
            }
          })
        }

        if (joinedFarms.length > 0) {
          totalInFarms = totalInFarms.plus(
            position.data?.currentValueHuman ?? 0,
          )
        }

        totalBalanceDisplay = totalBalanceDisplay.plus(
          position.data?.currentTotalDisplay ?? 0,
        )

        const isJoinedAllFarms = farmsToJoin.size === 0

        return {
          poolId: id,
          joinedFarms,
          isJoinedAllFarms,
          meta,
          stableswapId,
          ...position,
        }
      })

    if (aStableswapDisplayBalance) {
      totalBalanceDisplay = totalBalanceDisplay.plus(aStableswapDisplayBalance)
    }

    return {
      positions: stablepoolPosition
        ? [stablepoolPosition, ...positionData]
        : positionData,
      totalInFarms: totalInFarms.toString(),
      totalBalanceDisplay: totalBalanceDisplay.toString(),
      aStableswapDisplayBalance,
    }
  }, [
    stablepoolPosition,
    positions,
    aStableswapDisplayBalance,
    id,
    meta,
    allFarms,
    farms,
    stableswapId,
  ])

  return data
}

export const useUserPositionsTotal = (pool: OmnipoolAssetTable) => {
  const {
    positions,
    stableswapBalance,
    aStableswapBalance,
    aStableswapAsset,
    meta,
    price,
  } = pool

  const { price: aStableswapPrice, isValid: aStableswapIsValid } =
    useAssetPrice(stableswapBalance ? aStableswapAsset?.id : undefined)

  const aStableswapDisplayBalance = (() => {
    if (!aStableswapBalance || !aStableswapAsset || !aStableswapIsValid)
      return undefined

    return Big(scaleHuman(aStableswapBalance, aStableswapAsset.decimals))
      .times(aStableswapPrice)
      .toString()
  })()

  const stablepoolDisplayBalance = (() => {
    if (!stableswapBalance) return undefined

    const freeBalance = scaleHuman(stableswapBalance, meta.decimals)

    return price ? Big(price).times(freeBalance).toString() : undefined
  })()

  const positionsDisplayTotal = positions.reduce(
    (acc, position) => acc.plus(position.data?.currentTotalDisplay ?? 0),
    Big(0),
  )

  return positionsDisplayTotal
    .plus(aStableswapDisplayBalance ?? 0)
    .plus(stablepoolDisplayBalance ?? 0)
    .toString()
}

export const useUserIsolatedPositionsTotal = (pool: IsolatedPoolTable) => {
  const { positions, id, meta } = pool

  const { data: liquidity } = useXYKPoolsLiquidity(id)

  const price = Big(pool.tvlDisplay)
    .div(liquidity ? scaleHuman(liquidity, pool.meta.decimals) : 1)
    .toString()

  return positions
    .reduce(
      (acc, position) =>
        acc.plus(Big(price).times(scaleHuman(position.shares, meta.decimals))),
      Big(0),
    )
    .toString()
}
