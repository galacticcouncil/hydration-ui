import Big from "big.js"
import { useMemo } from "react"

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

export type OmnipoolPositionTableData = {
  poolId: string
  joinedFarms: string[]
  meta: TAssetData
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
  const { meta, positions, id } = pool

  const data = useMemo(() => {
    let totalBalance = Big(0)
    let totalHubBalance = Big(0)
    let totalInFarms = Big(0)
    let totalBalanceDisplay = Big(0)

    const positionData = positions
      .sort((a, b) => {
        return numericallyStrDesc(a.positionId, b.positionId)
      })
      .map((position): OmnipoolPositionTableData => {
        const joinedFarms = isOmnipoolDepositPosition(position)
          ? position.yield_farm_entries.map((entry) =>
              entry.global_farm_id.toString(),
            )
          : []

        totalBalance = totalBalance.plus(position.data?.currentValueHuman ?? 0)
        totalHubBalance = totalHubBalance.plus(
          position.data?.currentHubValueHuman ?? 0,
        )

        if (joinedFarms.length > 0) {
          totalInFarms = totalInFarms.plus(
            position.data?.currentValueHuman ?? 0,
          )
        }

        totalBalanceDisplay = totalBalanceDisplay.plus(
          position.data?.currentTotalDisplay ?? 0,
        )

        return {
          poolId: id,
          joinedFarms,
          meta,
          ...position,
        }
      })

    return {
      positions: positionData,
      totalBalance: totalBalance.toString(),
      totalHubBalance: totalHubBalance.toString(),
      totalInFarms: totalInFarms.toString(),
      totalBalanceDisplay: totalBalanceDisplay.toString(),
    }
  }, [id, meta, positions])

  return data
}
