import { ReserveDataHumanized } from "@aave/contract-helpers"
import {
  formatReservesAndIncentives,
  formatUserSummaryAndIncentives,
  valueToBigNumber,
  WEI_DECIMALS,
} from "@aave/math-utils"
import { EmodeCategory } from "sections/lending/helpers/types"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"
import {
  CustomMarket,
  marketsData,
} from "sections/lending/utils/marketsAndNetworksConfig"

import { PoolReserve } from "./poolSlice"
import { RootStore } from "./root"
import { GHO_SYMBOL } from "sections/lending/utils/ghoUtilities"
import { produce } from "immer"
import { getAddressFromAssetId } from "utils/evm"
import {
  DOT_ASSET_ID,
  GDOT_STABLESWAP_ASSET_ID,
  VDOT_ASSET_ID,
} from "utils/constants"

export const selectCurrentChainIdMarkets = (state: RootStore) => {
  const marketNames = Object.keys(marketsData)
  return Object.values(marketsData)
    .map((marketData, index) => ({
      ...marketData,
      marketName: marketNames[index] as CustomMarket,
    }))
    .filter(
      (marketData) =>
        marketData.chainId === state.currentChainId &&
        state.currentNetworkConfig.isFork === marketData.isFork,
    )
}

export const selectCurrentChainIdV2MarketData = (state: RootStore) => {
  return state.currentMarketData
}

export const selectCurrentChainIdV3MarketData = (state: RootStore) => {
  const currentChainIdMarkets = selectCurrentChainIdMarkets(state)
  const marketData = currentChainIdMarkets.filter((marketData) => marketData.v3)
  return marketData[0]
}

export const selectCurrentChainIdV2PoolReserve = (state: RootStore) => {
  const marketData = selectCurrentChainIdV2MarketData(state)
  const v2MarketAddressProvider = marketData
    ? marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
    : undefined
  const currentChainId = state.currentChainId
  if (v2MarketAddressProvider && currentChainId) {
    return state.data.get(state.currentChainId)?.get(v2MarketAddressProvider)
  }
  return undefined
}

export const selectCurrentChainIdV3PoolReserve = (state: RootStore) => {
  const marketData = selectCurrentChainIdV3MarketData(state)
  const v3MarketAddressProvider = marketData
    ? marketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
    : undefined
  const currentChainId = state.currentChainId
  if (v3MarketAddressProvider && currentChainId) {
    return state.data.get(state.currentChainId)?.get(v3MarketAddressProvider)
  }
  return undefined
}

export const selectCurrentUserLendingPoolData = (state: RootStore) => {
  const marketAddressProvider = state.currentMarketData
    ? state.currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
    : undefined
  const currentChainId = state.currentChainId
  if (marketAddressProvider && currentChainId) {
    return state.data.get(state.currentChainId)?.get(marketAddressProvider)
  }
  return undefined
}

export const selectFormatUserEmodeCategoryId = (reserve?: PoolReserve) => {
  return reserve?.userEmodeCategoryId || 0
}

export const selectCurrentUserEmodeCategoryId = (state: RootStore): number => {
  return selectFormatUserEmodeCategoryId(
    selectCurrentUserLendingPoolData(state),
  )
}

export const selectFormatUserReserves = (reserve?: PoolReserve) => {
  return reserve?.userReserves || []
}

export const selectCurrentUserReserves = (state: RootStore) => {
  return selectFormatUserReserves(selectCurrentUserLendingPoolData(state))
}

export const selectFormatReserves = (reserve?: PoolReserve) => {
  return reserve?.reserves || []
}

export const selectCurrentReserves = (state: RootStore) => {
  return selectFormatReserves(selectCurrentUserLendingPoolData(state))
}

export const selectFormatBaseCurrencyData = (reserve?: PoolReserve) => {
  return (
    reserve?.baseCurrencyData || {
      marketReferenceCurrencyDecimals: 0,
      marketReferenceCurrencyPriceInUsd: "0",
      networkBaseTokenPriceInUsd: "0",
      networkBaseTokenPriceDecimals: 0,
    }
  )
}

export const selectCurrentBaseCurrencyData = (state: RootStore) => {
  return selectFormatBaseCurrencyData(selectCurrentUserLendingPoolData(state))
}

export const reserveSortFn = (
  a: { totalLiquidityUSD: string; symbol: string },
  b: { totalLiquidityUSD: string; symbol: string },
) => {
  if (a.symbol === GHO_SYMBOL) return -1
  if (b.symbol === GHO_SYMBOL) return 1
  const numA = parseFloat(a.totalLiquidityUSD)
  const numB = parseFloat(b.totalLiquidityUSD)

  return numB > numA ? 1 : -1
}

export const selectFormattedReserves = (
  state: RootStore,
  currentTimestamp: number,
) => {
  const reserves = selectCurrentReserves(state)
  const baseCurrencyData = selectCurrentBaseCurrencyData(state)
  const currentNetworkConfig = state.currentNetworkConfig

  const defaultReserveIncentives = state.reserveIncentiveData || []
  const reserveIncentives = defaultReserveIncentives.map((incentive) => {
    if (!incentive.aIncentiveData.rewardsTokenInformation.length) {
      return incentive
    }

    return produce(incentive, (draft) => {
      draft.aIncentiveData.rewardsTokenInformation.forEach((reward) => {
        // emissionPerSecond is expected to be in WEI, so we need to convert it to the correct decimals
        reward.emissionPerSecond = valueToBigNumber(reward.emissionPerSecond)
          .shiftedBy(WEI_DECIMALS - reward.rewardTokenDecimals)
          .toString()
      })
    })
  })

  const formattedPoolReserves = formatReservesAndIncentives({
    reserves,
    currentTimestamp,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    reserveIncentives: reserveIncentives,
  })
    .map((r) => ({
      ...r,
      ...fetchIconSymbolAndName(r),
      isEmodeEnabled: r.eModeCategoryId !== 0,
      isWrappedBaseAsset:
        r.symbol.toLowerCase() ===
        currentNetworkConfig.wrappedBaseAssetSymbol?.toLowerCase(),
    }))
    .sort(reserveSortFn)

  return produce(formattedPoolReserves, (draft) => {
    const reserveMap = new Map(draft.map((r) => [r.underlyingAsset, r]))

    const vDotReserve = reserveMap.get(getAddressFromAssetId(VDOT_ASSET_ID))

    if (vDotReserve) {
      const vDotApy = valueToBigNumber(vDotReserve.supplyAPY).plus(
        state.vDotApy,
      )

      vDotReserve.supplyAPY = vDotApy.toString()

      const dotReserve = reserveMap.get(getAddressFromAssetId(DOT_ASSET_ID))
      const gDotReserve = reserveMap.get(
        getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID),
      )

      if (gDotReserve && dotReserve) {
        const dotApyHalf = valueToBigNumber(dotReserve.supplyAPY).div(2)
        const vdotApyHalf = vDotApy.div(2)

        // @TODO: Add GDOT LP Fee when available
        const gdotLpFee = "0"

        gDotReserve.supplyAPY = vdotApyHalf
          .plus(dotApyHalf)
          .plus(gdotLpFee)
          .toString()
      }
    }
  })
}

export const selectUserSummaryAndIncentives = (
  state: RootStore,
  currentTimestamp: number,
) => {
  const baseCurrencyData = selectCurrentBaseCurrencyData(state)
  const userReserves = selectCurrentUserReserves(state)
  const formattedPoolReserves = selectFormattedReserves(state, currentTimestamp)
  const userEmodeCategoryId = selectCurrentUserEmodeCategoryId(state)
  const reserveIncentiveData = state.reserveIncentiveData
  const userIncentiveData = state.userIncentiveData

  return formatUserSummaryAndIncentives({
    currentTimestamp,
    marketReferencePriceInUsd:
      baseCurrencyData.marketReferenceCurrencyPriceInUsd,
    marketReferenceCurrencyDecimals:
      baseCurrencyData.marketReferenceCurrencyDecimals,
    userReserves,
    formattedReserves: formattedPoolReserves,
    userEmodeCategoryId: userEmodeCategoryId,
    reserveIncentives: reserveIncentiveData || [],
    userIncentives: userIncentiveData || [],
  })
}

export const selectUserNonEmtpySummaryAndIncentive = (
  state: RootStore,
  currentTimestamp: number,
) => {
  const user = selectUserSummaryAndIncentives(state, currentTimestamp)
  const userReservesData = user.userReservesData.filter(
    (userReserve) => userReserve.underlyingBalance !== "0",
  )
  return {
    ...user,
    userReservesData,
  }
}

export const selectNonEmptyUserBorrowPositions = (
  state: RootStore,
  currentTimestamp: number,
) => {
  const user = selectUserSummaryAndIncentives(state, currentTimestamp)
  const borrowedPositions = user.userReservesData.filter(
    (reserve) =>
      reserve.variableBorrows !== "0" || reserve.stableBorrows !== "0",
  )
  return borrowedPositions
}

export const formatEmodes = (reserves: ReserveDataHumanized[]) => {
  const eModes = reserves.reduce(
    (acc, r) => {
      if (!acc[r.eModeCategoryId])
        acc[r.eModeCategoryId] = {
          liquidationBonus: r.eModeLiquidationBonus,
          id: r.eModeCategoryId,
          label:
            r.eModeLabel === "Stablecoins"
              ? r.eModeLabel
              : `${r.eModeLabel} Correlated`,
          liquidationThreshold: r.eModeLiquidationThreshold,
          ltv: r.eModeLtv,
          priceSource: r.eModePriceSource,
          assets: [r.symbol],
        }
      else acc[r.eModeCategoryId].assets.push(r.symbol)
      return acc
    },
    {} as Record<number, EmodeCategory>,
  )

  return eModes
}

export const selectEmodes = (state: RootStore) => {
  const reserves = selectCurrentReserves(state)
  return formatEmodes(reserves)
}

export const selectEmodesV3 = (state: RootStore) => {
  const reserves = selectFormatReserves(
    selectCurrentChainIdV3PoolReserve(state),
  )
  return formatEmodes(reserves)
}
