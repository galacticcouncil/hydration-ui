import {
  formatGhoReserveData,
  formatGhoUserData,
  FormattedGhoReserveData,
  FormattedGhoUserData,
  formatUserSummaryWithDiscount,
  USD_DECIMALS,
  UserReserveData,
} from "@aave/math-utils"
import { Big } from "big.js"
import { formatUnits } from "ethers/lib/utils"
import React, { useContext } from "react"

import { EmodeCategory } from "@/helpers/types"
import { ComputedReserveData, ExtendedFormattedUser } from "@/hooks/commonTypes"
import { useCurrentTimestamp } from "@/hooks/useCurrentTimestamp"
import { useProtocolDataContext } from "@/hooks/useProtocolDataContext"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import {
  reserveSortFn,
  selectCurrentBaseCurrencyData,
  selectCurrentReserves,
  selectCurrentUserEmodeCategoryId,
  selectCurrentUserReserves,
  selectEmodes,
  selectFormattedReserves,
  selectUserSummaryAndIncentives,
} from "@/store/poolSelectors"
import { useRootStore } from "@/store/root"
import {
  GHO_SUPPORTED_MARKETS,
  GHO_SYMBOL,
  weightedAverageAPY,
} from "@/utils/ghoUtilities"

/**
 * removes the marketPrefix from a symbol
 * @param symbol
 * @param prefix
 */
export const unPrefixSymbol = (symbol: string, prefix: string) => {
  return symbol
    .toUpperCase()
    .replace(RegExp(`^(${prefix[0]}?${prefix.slice(1)})`), "")
}

export interface AppDataContextType {
  loading: boolean
  isConnected: boolean
  reserves: ComputedReserveData[]
  eModes: Record<number, EmodeCategory>
  isUserHasDeposits: boolean
  user: ExtendedFormattedUser
  marketReferencePriceInUsd: string
  marketReferenceCurrencyDecimals: number
  userReserves: UserReserveData[]
  ghoReserveData: FormattedGhoReserveData
  ghoUserData: FormattedGhoUserData
  ghoLoadingData: boolean
  ghoEnabled: boolean
}

export const AppDataContext = React.createContext<AppDataContextType>(
  {} as AppDataContextType,
)

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */
export const AppDataProvider: React.FC<{
  children?: React.ReactNode
}> = ({ children }) => {
  const currentTimestamp = useCurrentTimestamp(60)
  const { currentAccount } = useWeb3Context()
  const { currentMarket } = useProtocolDataContext()

  const [
    reserves,
    baseCurrencyData,
    userReserves,
    userEmodeCategoryId,
    eModes,
    ghoReserveData,
    ghoUserData,
    ghoReserveDataFetched,
    formattedPoolReserves,
    userSummary,
    displayGho,
  ] = useRootStore((state) => [
    selectCurrentReserves(state),
    selectCurrentBaseCurrencyData(state),
    selectCurrentUserReserves(state),
    selectCurrentUserEmodeCategoryId(state),
    selectEmodes(state),
    state.ghoReserveData,
    state.ghoUserData,
    state.ghoReserveDataFetched,
    selectFormattedReserves(state, currentTimestamp),
    selectUserSummaryAndIncentives(state, currentTimestamp),
    state.displayGho,
  ])

  const formattedGhoReserveData: FormattedGhoReserveData = formatGhoReserveData(
    {
      ghoReserveData,
    },
  )
  const formattedGhoUserData: FormattedGhoUserData = formatGhoUserData({
    ghoReserveData,
    ghoUserData,
    currentTimestamp,
  })

  let ghoBorrowCap = "0"
  let aaveFacilitatorRemainingCapacity = Math.max(
    formattedGhoReserveData.aaveFacilitatorRemainingCapacity - 0.000001,
    0,
  )
  let user = userSummary
  // Factor discounted GHO interest into cumulative user fields
  if (GHO_SUPPORTED_MARKETS.includes(currentMarket)) {
    ghoBorrowCap =
      reserves.find((r) => r.symbol === GHO_SYMBOL)?.borrowCap || "0"

    if (ghoBorrowCap && ghoBorrowCap !== "0") {
      aaveFacilitatorRemainingCapacity = Number(ghoBorrowCap)
    }

    if (formattedGhoUserData.userDiscountedGhoInterest > 0) {
      const userSummaryWithDiscount = formatUserSummaryWithDiscount({
        userGhoDiscountedInterest:
          formattedGhoUserData.userDiscountedGhoInterest,
        user,
        marketReferenceCurrencyPriceUSD: Number(
          formatUnits(
            baseCurrencyData.marketReferenceCurrencyPriceInUsd,
            USD_DECIMALS,
          ),
        ),
      })
      user = {
        ...user,
        ...userSummaryWithDiscount,
      }
    }
  }

  const proportions = user.userReservesData.reduce(
    (acc, value) => {
      const reserve = formattedPoolReserves.find(
        (r) => r.underlyingAsset === value.reserve.underlyingAsset,
      )

      if (reserve) {
        if (value.underlyingBalanceUSD !== "0") {
          acc.positiveProportion = acc.positiveProportion.plus(
            Big(reserve.supplyAPY).mul(value.underlyingBalanceUSD),
          )
          if (reserve.aIncentivesData) {
            reserve.aIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                Big(incentive.incentiveAPR).mul(value.underlyingBalanceUSD),
              )
            })
          }
        }
        if (value.variableBorrowsUSD !== "0") {
          // TODO: Export to unified helper function
          if (
            displayGho({ symbol: reserve.symbol, currentMarket: currentMarket })
          ) {
            const borrowRateAfterDiscount = weightedAverageAPY(
              formattedGhoReserveData.ghoVariableBorrowAPY,
              formattedGhoUserData.userGhoBorrowBalance,
              formattedGhoUserData.userGhoAvailableToBorrowAtDiscount,
              formattedGhoReserveData.ghoBorrowAPYWithMaxDiscount,
            )
            acc.negativeProportion = acc.negativeProportion.plus(
              Big(borrowRateAfterDiscount).mul(
                formattedGhoUserData.userGhoBorrowBalance,
              ),
            )
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  Big(incentive.incentiveAPR).mul(
                    formattedGhoUserData.userGhoBorrowBalance,
                  ),
                )
              })
            }
          } else {
            acc.negativeProportion = acc.negativeProportion.plus(
              Big(reserve.variableBorrowAPY).mul(value.variableBorrowsUSD),
            )
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  Big(incentive.incentiveAPR).mul(value.variableBorrowsUSD),
                )
              })
            }
          }
        }
        if (value.stableBorrowsUSD !== "0") {
          acc.negativeProportion = acc.negativeProportion.plus(
            Big(value.stableBorrowAPY).mul(value.stableBorrowsUSD),
          )
          if (reserve.sIncentivesData) {
            reserve.sIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                Big(incentive.incentiveAPR).mul(value.stableBorrowsUSD),
              )
            })
          }
        }
      } else {
        throw new Error("no possible to calculate net apy")
      }

      return acc
    },
    {
      positiveProportion: Big(0),
      negativeProportion: Big(0),
    },
  )

  const isUserHasDeposits = user.userReservesData.some(
    (userReserve) => userReserve.scaledATokenBalance !== "0",
  )

  const earnedAPY = Big(user.totalLiquidityUSD).gt(0)
    ? proportions.positiveProportion.div(user.totalLiquidityUSD).toNumber()
    : 0
  const debtAPY = Big(user.totalBorrowsUSD).gt(0)
    ? proportions.negativeProportion.div(user.totalBorrowsUSD).toNumber()
    : 0

  const netAPY =
    (earnedAPY || 0) *
      (Number(user.totalLiquidityUSD) /
        Number(user.netWorthUSD !== "0" ? user.netWorthUSD : "1")) -
    (debtAPY || 0) *
      (Number(user.totalBorrowsUSD) /
        Number(user.netWorthUSD !== "0" ? user.netWorthUSD : "1"))

  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === "0"
      ? "0"
      : Big(user?.totalBorrowsMarketReferenceCurrency || "0")
          .div(user?.totalCollateralMarketReferenceCurrency || "1")
          .toString()

  return (
    <AppDataContext.Provider
      value={{
        loading: !reserves.length || (!!currentAccount && !userReserves.length),
        isConnected: !!currentAccount,
        reserves: formattedPoolReserves,
        eModes,
        user: {
          ...user,
          loanToValue,
          totalBorrowsUSD: user.totalBorrowsUSD,
          totalBorrowsMarketReferenceCurrency:
            user.totalBorrowsMarketReferenceCurrency,
          userEmodeCategoryId,
          isInEmode: userEmodeCategoryId !== 0,
          userReservesData: user.userReservesData.sort((a, b) =>
            reserveSortFn(a.reserve, b.reserve),
          ),
          earnedAPY,
          debtAPY,
          netAPY,
        },
        userReserves,
        isUserHasDeposits,
        marketReferencePriceInUsd:
          baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          baseCurrencyData.marketReferenceCurrencyDecimals,
        // TODO: we should consider removing this from the context and use zustand instead. If we had a selector that would return the formatted gho data, I think that
        // would work out pretty well. We could even extend that pattern for the other reserves, and migrate towards the global store instead of the app data provider.
        // ghoLoadingData for now is just propagated through to reduce changes to other components.
        ghoReserveData: {
          ...formattedGhoReserveData,
          aaveFacilitatorRemainingCapacity,
        },
        ghoUserData: formattedGhoUserData,
        ghoLoadingData: !ghoReserveDataFetched,
        ghoEnabled: formattedGhoReserveData.ghoBaseVariableBorrowRate > 0,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppDataContext = () => useContext(AppDataContext)
