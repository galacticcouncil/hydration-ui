import Big from "big.js"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { XykDeposit } from "@/api/account"
import { TAssetData } from "@/api/assets"
import { Farm } from "@/api/farms"
import { useXYKPoolWithLiquidity } from "@/api/xyk"
import {
  TAprByRewardAsset,
  TJoinedFarm,
  useDepositAprs,
} from "@/modules/liquidity/components/Farms/Farms.utils"
import {
  IsolatedPoolTable,
  OmnipoolAssetTable,
} from "@/modules/liquidity/Liquidity.utils"
import { XYKPoolMeta } from "@/providers/assetsProvider"
import { AccountOmnipoolPosition } from "@/states/account"
import { useAssetPrice } from "@/states/displayAsset"
import { scaleHuman } from "@/utils/formatting"
import { numericallyStrDesc } from "@/utils/sort"

export type IsolatedPositionTableData = {
  poolId: string
  joinedFarms: TJoinedFarm[]
  farmsToJoin: Farm[]
  isJoinedAllFarms: boolean
  aprsByRewardAsset: TAprByRewardAsset[]
  shareTokens: string
  shareTokensDisplay: string
  shareTokenId: string
  positionId?: string
  meta: XYKPoolMeta
  position?: XykDeposit
}

export type BalanceTableData = {
  label: string
  poolId: string
  isStablepoolInOmnipool: boolean
  value: string
  valueDisplay: string | undefined
  meta: TAssetData
  stableswapId: string
  canAddLiquidity: boolean
  canRemoveLiquidity: boolean
}

export type OmnipoolPositionTableData = {
  poolId: string
  joinedFarms: TJoinedFarm[]
  farmsToJoin: Farm[]
  aprsByRewardAsset: TAprByRewardAsset[]
  isJoinedAllFarms: boolean
  meta: TAssetData
  stableswapId?: string
  canAddLiquidity: boolean
  canRemoveLiquidity: boolean
} & AccountOmnipoolPosition

export const useIsolatedPositions = (pool: IsolatedPoolTable) => {
  const { balance, meta, shareTokenId, positions, id, allFarms } = pool

  const getDepositAprs = useDepositAprs()

  const { data: poolWithLiquidity } = useXYKPoolWithLiquidity(id)
  const liquidity = poolWithLiquidity?.totalLiquidity

  const price = Big(pool.tvlDisplay)
    .div(liquidity ? scaleHuman(liquidity, pool.meta.decimals) : 1)
    .toString()

  const data = useMemo(() => {
    const freeBalance = Big(scaleHuman(balance ?? 0, meta.decimals))

    let totalInFarms = Big(0)
    let totalBalanceDisplay = Big(0)

    const positionsData = positions
      .sort((a, b) => numericallyStrDesc(a.id, b.id))
      .map((position): IsolatedPositionTableData => {
        const { aprsByRewardAsset, joinedFarms, farmsToJoin } = getDepositAprs(
          position,
          allFarms,
        )

        const shareTokens = scaleHuman(position.shares, meta.decimals)
        const shareTokensDisplay = Big(shareTokens).times(price).toString()

        totalInFarms = totalInFarms.plus(shareTokensDisplay)

        return {
          poolId: id,
          joinedFarms,
          aprsByRewardAsset,
          isJoinedAllFarms: farmsToJoin.length === 0,
          farmsToJoin,
          shareTokens,
          shareTokensDisplay,
          positionId: position.id,
          shareTokenId,
          meta,
          position,
        }
      })

    totalBalanceDisplay = totalBalanceDisplay.plus(totalInFarms)

    if (freeBalance.gt(0)) {
      const shareTokensDisplay = freeBalance.times(price).toString()
      totalBalanceDisplay = totalBalanceDisplay.plus(shareTokensDisplay)

      const liquidity = {
        poolId: id,
        joinedFarms: [],
        aprsByRewardAsset: [],
        isJoinedAllFarms: true,
        farmsToJoin: [],
        shareTokens: freeBalance.toString(),
        shareTokensDisplay,
        shareTokenId,
        meta,
      }

      positionsData.unshift(liquidity)
    }

    return {
      positions: positionsData,
      totalInFarms: totalInFarms.toString(),
      totalBalanceDisplay: totalBalanceDisplay.toString(),
    }
  }, [
    balance,
    id,
    meta,
    positions,
    price,
    shareTokenId,
    allFarms,
    getDepositAprs,
  ])

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
    stablepoolData,
    canAddLiquidity,
    canRemoveLiquidity,
  } = pool

  const getDepositAprs = useDepositAprs()

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
      canAddLiquidity: true,
      canRemoveLiquidity: true,
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
        const { aprsByRewardAsset, joinedFarms, farmsToJoin } = getDepositAprs(
          position,
          allFarms,
        )

        if (joinedFarms.length > 0) {
          totalInFarms = totalInFarms.plus(
            position.data.currentTotalDisplay ?? 0,
          )
        }

        totalBalanceDisplay = totalBalanceDisplay.plus(
          position.data.currentTotalDisplay ?? 0,
        )

        const isJoinedAllFarms = farmsToJoin.length === 0

        return {
          poolId: id,
          joinedFarms,
          aprsByRewardAsset,
          isJoinedAllFarms,
          farmsToJoin,
          meta,
          stableswapId,
          canAddLiquidity,
          canRemoveLiquidity,
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
    stableswapId,
    getDepositAprs,
    canAddLiquidity,
    canRemoveLiquidity,
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
    useAssetPrice(stableswapBalance || aStableswapBalance ? meta.id : undefined)

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
  const { positions, id, meta, balance } = pool

  const { data: poolWithLiquidity } = useXYKPoolWithLiquidity(id)
  const liquidity = poolWithLiquidity?.totalLiquidity

  const price = Big(pool.tvlDisplay)
    .div(liquidity ? scaleHuman(liquidity, pool.meta.decimals) : 1)
    .toString()
  const balanceDisplay = balance
    ? Big(price).times(scaleHuman(balance, meta.decimals)).toString()
    : undefined

  return positions
    .reduce(
      (acc, position) =>
        acc.plus(Big(price).times(scaleHuman(position.shares, meta.decimals))),
      Big(balanceDisplay ?? 0),
    )
    .toString()
}
