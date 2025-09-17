import { ReserveDataHumanized } from "@aave/contract-helpers"
import {
  ComputedUserReserve,
  formatGhoReserveData,
  formatGhoUserData,
  formatReservesAndIncentives,
  FormattedGhoReserveData,
  FormattedGhoUserData,
  FormatUserSummaryAndIncentivesResponse,
  formatUserSummaryWithDiscount,
  USD_DECIMALS,
  UserReserveData,
} from "@aave/math-utils"
import {
  calculateUserReserveIncentives,
  UserReserveIncentive,
} from "@aave/math-utils/dist/esm/formatters/incentive/calculate-user-reserve-incentives"
import BigNumber from "bignumber.js"
import { formatUnits } from "ethers/lib/utils"
import React, { useContext } from "react"
import { EmodeCategory } from "sections/lending/helpers/types"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { useRootStore } from "sections/lending/store/root"
import {
  GHO_SUPPORTED_MARKETS,
  GHO_SYMBOL,
  weightedAverageAPY,
} from "sections/lending/utils/ghoUtilities"

import {
  reserveSortFn,
  selectCurrentBaseCurrencyData,
  selectCurrentReserves,
  selectCurrentUserEmodeCategoryId,
  selectCurrentUserReserves,
  selectEmodes,
  selectFormattedReserves,
  selectUserSummaryAndIncentives,
} from "sections/lending/store/poolSelectors"
import { useCurrentTimestamp } from "sections/lending/hooks/useCurrentTimestamp"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { usePatchReserve } from "sections/lending/ui-config/reservePatches"
import {
  ExternalApyData,
  useExternalApyData,
} from "sections/lending/hooks/app-data-provider/useExternalApyData"
import { useShallow } from "hooks/useShallow"
import { scaleHuman } from "utils/balance"
import BN from "bignumber.js"

interface UserReserveIncentiveWithReserve
  extends Omit<UserReserveIncentive, "accruedRewards" | "unclaimedRewards"> {
  accruedRewards: string
  unclaimedRewards: string
  accruedRewardsHuman: string
  unclaimedRewardsHuman: string
  totalRewards: string
  reserveUnderlyingAsset: string
  reserveSymbol: string
  reserveName: string
}

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

export type ComputedReserveData = ReturnType<
  typeof formatReservesAndIncentives
>[0] &
  ReserveDataHumanized & {
    iconSymbol: string
    isEmodeEnabled: boolean
    isWrappedBaseAsset: boolean
  }

export type ComputedUserReserveData = ComputedUserReserve<ComputedReserveData>

export type ExtendedFormattedUser =
  FormatUserSummaryAndIncentivesResponse<ComputedReserveData> & {
    earnedAPY: number
    debtAPY: number
    netAPY: number
    isInEmode: boolean
    userEmodeCategoryId: number
  }

export interface AppDataContextType {
  loading: boolean
  reserves: ComputedReserveData[]
  eModes: Record<number, EmodeCategory>
  // refreshPoolData?: () => Promise<void[]>;
  isUserHasDeposits: boolean
  user: ExtendedFormattedUser
  // refreshIncentives?: () => Promise<void>;
  // loading: boolean;

  marketReferencePriceInUsd: string
  marketReferenceCurrencyDecimals: number
  userReserves: UserReserveData[]
  ghoReserveData: FormattedGhoReserveData
  ghoUserData: FormattedGhoUserData
  ghoLoadingData: boolean
  ghoEnabled: boolean
  externalApyData: ExternalApyData
}

const AppDataContext = React.createContext<AppDataContextType>(
  {} as AppDataContextType,
)

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */
export const AppDataProvider: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const currentTimestamp = useCurrentTimestamp(60)
  const { currentAccount } = useWeb3Context()
  const { currentMarket } = useProtocolDataContext()
  const externalApyData = useExternalApyData()

  const [
    reserves,
    baseCurrencyData,
    userReserves,
    userEmodeCategoryId,
    eModes,
    ghoReserveData,
    ghoUserData,
    ghoReserveDataFetched,
    formattedReserves,
    userSummary,
    displayGho,
    reserveIncentiveData,
    userIncentiveData,
  ] = useRootStore(
    useShallow((state) => [
      selectCurrentReserves(state),
      selectCurrentBaseCurrencyData(state),
      selectCurrentUserReserves(state),
      selectCurrentUserEmodeCategoryId(state),
      selectEmodes(state),
      state.ghoReserveData,
      state.ghoUserData,
      state.ghoReserveDataFetched,
      selectFormattedReserves(state, currentTimestamp, externalApyData),
      selectUserSummaryAndIncentives(state, currentTimestamp, externalApyData),
      state.displayGho,
      state.reserveIncentiveData,
      state.userIncentiveData,
    ]),
  )

  const patchReserve = usePatchReserve()

  const formattedGhoReserveData: FormattedGhoReserveData = formatGhoReserveData(
    {
      ghoReserveData,
    },
  )

  const formattedPoolReserves = formattedReserves.map((reserve) =>
    patchReserve(reserve, formattedGhoReserveData),
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
            new BigNumber(reserve.supplyAPY).multipliedBy(
              value.underlyingBalanceUSD,
            ),
          )
          if (reserve.aIncentivesData) {
            reserve.aIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(
                  value.underlyingBalanceUSD,
                ),
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
              new BigNumber(borrowRateAfterDiscount).multipliedBy(
                formattedGhoUserData.userGhoBorrowBalance,
              ),
            )
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  new BigNumber(incentive.incentiveAPR).multipliedBy(
                    formattedGhoUserData.userGhoBorrowBalance,
                  ),
                )
              })
            }
          } else {
            acc.negativeProportion = acc.negativeProportion.plus(
              new BigNumber(reserve.variableBorrowAPY).multipliedBy(
                value.variableBorrowsUSD,
              ),
            )
            if (reserve.vIncentivesData) {
              reserve.vIncentivesData.forEach((incentive) => {
                acc.positiveProportion = acc.positiveProportion.plus(
                  new BigNumber(incentive.incentiveAPR).multipliedBy(
                    value.variableBorrowsUSD,
                  ),
                )
              })
            }
          }
        }
        if (value.stableBorrowsUSD !== "0") {
          acc.negativeProportion = acc.negativeProportion.plus(
            new BigNumber(value.stableBorrowAPY).multipliedBy(
              value.stableBorrowsUSD,
            ),
          )
          if (reserve.sIncentivesData) {
            reserve.sIncentivesData.forEach((incentive) => {
              acc.positiveProportion = acc.positiveProportion.plus(
                new BigNumber(incentive.incentiveAPR).multipliedBy(
                  value.stableBorrowsUSD,
                ),
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
      positiveProportion: new BigNumber(0),
      negativeProportion: new BigNumber(0),
    },
  )

  const isUserHasDeposits = user.userReservesData.some(
    (userReserve) => userReserve.scaledATokenBalance !== "0",
  )

  const userReserveIncentives = React.useMemo(() => {
    if (!userSummary.userReservesData.length || !formattedPoolReserves.length) {
      return []
    }

    const incentivesWithReserveInfo: UserReserveIncentiveWithReserve[] = []

    userSummary.userReservesData.forEach((userReserve) => {
      const reserve = formattedPoolReserves.find(
        (r) => r.underlyingAsset === userReserve.reserve.underlyingAsset,
      )

      if (!reserve) return

      const reserveIncentiveDataItem = reserveIncentiveData?.find(
        (incentive) => incentive.underlyingAsset === reserve.underlyingAsset,
      )
      const userIncentiveDataItem = userIncentiveData?.find(
        (incentive) => incentive.underlyingAsset === reserve.underlyingAsset,
      )

      if (!reserveIncentiveDataItem || !userIncentiveDataItem) return

      const userReserveCalculationData = {
        scaledATokenBalance: userReserve.scaledATokenBalance,
        scaledVariableDebt: userReserve.scaledVariableDebt,
        principalStableDebt: userReserve.principalStableDebt,
        reserve: {
          underlyingAsset: reserve.underlyingAsset,
          totalLiquidity: reserve.totalLiquidity,
          liquidityIndex: reserve.liquidityIndex,
          totalScaledVariableDebt: reserve.totalScaledVariableDebt,
          totalPrincipalStableDebt: reserve.totalPrincipalStableDebt,
          decimals: reserve.decimals,
        },
      }

      try {
        const reserveIncentives = calculateUserReserveIncentives({
          reserveIncentives: reserveIncentiveDataItem,
          userIncentives: userIncentiveDataItem,
          currentTimestamp,
          userReserveData: userReserveCalculationData,
        })

        /*     console.table(
          reserveIncentives.map((incentive) => ({
            //...incentive,
            symbol: reserve.symbol,
            accruedRewardsHuman: scaleHuman(
              incentive.accruedRewards,
              incentive.rewardTokenDecimals,
            ).toString(),
          })),
        ) */

        reserveIncentives.forEach((incentive) => {
          const totalRewards = incentive.accruedRewards.plus(
            incentive.unclaimedRewards,
          )
          incentivesWithReserveInfo.push({
            ...incentive,
            accruedRewards: incentive.accruedRewards.toString(),
            accruedRewardsHuman: scaleHuman(
              incentive.accruedRewards,
              incentive.rewardTokenDecimals,
            ).toString(),
            unclaimedRewards: incentive.unclaimedRewards.toString(),
            unclaimedRewardsHuman: scaleHuman(
              incentive.unclaimedRewards,
              incentive.rewardTokenDecimals,
            ).toString(),
            totalRewards: totalRewards.toString(), // New field showing total rewards from this reserve
            reserveUnderlyingAsset: reserve.underlyingAsset,
            reserveSymbol: reserve.symbol,
            reserveName: reserve.name,
          })
        })
      } catch (error) {
        console.warn("Error calculating user reserve incentives:", error)
      }
    })

    return incentivesWithReserveInfo
  }, [
    userSummary.userReservesData,
    formattedPoolReserves,
    reserveIncentiveData,
    userIncentiveData,
    currentTimestamp,
  ])

  /* const allUserIncentives = React.useMemo(() => {
    if (
      !userSummary.userReservesData.length ||
      !reserveIncentiveData ||
      !userIncentiveData
    ) {
      return {}
    }

    // Prepare user reserves data for the calculation
    const userReservesCalculationData = userSummary.userReservesData
      .map((userReserve) => {
        const reserve = formattedPoolReserves.find(
          (r) => r.underlyingAsset === userReserve.reserve.underlyingAsset,
        )

        if (!reserve) return null

        return {
          scaledATokenBalance: userReserve.scaledATokenBalance,
          scaledVariableDebt: userReserve.scaledVariableDebt,
          principalStableDebt: userReserve.principalStableDebt,
          reserve: {
            underlyingAsset: reserve.underlyingAsset,
            totalLiquidity: reserve.totalLiquidity,
            liquidityIndex: reserve.liquidityIndex,
            totalScaledVariableDebt: reserve.totalScaledVariableDebt,
            totalPrincipalStableDebt: reserve.totalPrincipalStableDebt,
            decimals: reserve.decimals,
          },
        }
      })
      .filter((item): item is NonNullable<typeof item> => item !== null) // Remove null entries with proper typing

    try {
      const all = calculateAllUserIncentives({
        reserveIncentives: reserveIncentiveData,
        userIncentives: userIncentiveData,
        userReserves: userReservesCalculationData,
        currentTimestamp,
      })

      // Convert BigNumber claimableRewards to string for easier debugging
      const allWithStringRewards = Object.entries(all).reduce(
        (acc, [key, value]) => {
          acc[key] = {
            ...value,
            claimableRewards: value.claimableRewards.toString(),
          }
          return acc
        },
        {} as Record<
          string,
          Omit<UserIncentiveData, "claimableRewards"> & {
            claimableRewards: string
          }
        >,
      )

      return allWithStringRewards
    } catch (error) {
      console.warn("Error calculating all user incentives:", error)
      return {}
    }
  }, [
    userSummary.userReservesData,
    formattedPoolReserves,
    reserveIncentiveData,
    userIncentiveData,
    currentTimestamp,
  ]) */

  React.useEffect(() => {
    if (userReserveIncentives.length > 0) {
      const incentivesByReserve = userReserveIncentives.reduce(
        (acc, incentive) => {
          const reserveKey = `${incentive.reserveSymbol} (${incentive.reserveUnderlyingAsset})`
          if (!acc[reserveKey]) {
            acc[reserveKey] = []
          }
          acc[reserveKey].push(incentive)
          return acc
        },
        {} as Record<string, UserReserveIncentiveWithReserve[]>,
      )

      const rewardSymbol = "GDOT"

      const entries = Object.entries(incentivesByReserve).map(([_, value]) => {
        const gdot = value.find(
          (incentive) => incentive.rewardTokenSymbol === rewardSymbol,
        )
        return {
          reserve: gdot?.reserveSymbol,
          accruedRewards: BN(gdot?.accruedRewardsHuman ?? "0")
            .decimalPlaces(6)
            .toNumber(),
          unclaimedRewards: BN(gdot?.unclaimedRewardsHuman ?? "0")
            .decimalPlaces(6)
            .toNumber(),
          rewardSymbol: rewardSymbol,
        }
      })

      console.table(entries)
      const totalAccruedRewards = entries.reduce(
        (acc, entry) => BN(acc).plus(entry.accruedRewards).toNumber(),
        0,
      )
      console.log("Total accrued rewards:", totalAccruedRewards, rewardSymbol)
      console.log(
        "Total accrued with unclaimed rewards:",
        totalAccruedRewards + entries[0].unclaimedRewards,
        rewardSymbol,
      )
    }
  }, [userReserveIncentives])

  /*  React.useEffect(() => {
    if (Object.keys(allUserIncentives).length > 0) {
      console.log("All User Incentives calculated:", allUserIncentives)
    }
  }, [allUserIncentives]) */

  const earnedAPY = proportions.positiveProportion
    .dividedBy(user.totalLiquidityUSD)
    .toNumber()
  const debtAPY = proportions.negativeProportion
    .dividedBy(user.totalBorrowsUSD)
    .toNumber()
  const netAPY =
    (earnedAPY || 0) *
      (Number(user.totalLiquidityUSD) /
        Number(user.netWorthUSD !== "0" ? user.netWorthUSD : "1")) -
    (debtAPY || 0) *
      (Number(user.totalBorrowsUSD) /
        Number(user.netWorthUSD !== "0" ? user.netWorthUSD : "1"))

  return (
    <AppDataContext.Provider
      value={{
        loading: !reserves.length || (!!currentAccount && !userReserves.length),
        reserves: formattedPoolReserves,
        eModes,
        user: {
          ...user,
          totalBorrowsUSD: user.totalBorrowsUSD,
          totalBorrowsMarketReferenceCurrency:
            user.totalBorrowsMarketReferenceCurrency,
          userEmodeCategoryId,
          isInEmode: userEmodeCategoryId !== 0,
          userReservesData: user.userReservesData
            .map((userReserve) => ({
              ...userReserve,
              reserve: patchReserve(
                userReserve.reserve,
                formattedGhoReserveData,
              ),
            }))
            .sort((a, b) => reserveSortFn(a.reserve, b.reserve)),
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
        externalApyData,
      }}
    >
      {children}
    </AppDataContext.Provider>
  )
}

export const useAppDataContext = () => useContext(AppDataContext)
