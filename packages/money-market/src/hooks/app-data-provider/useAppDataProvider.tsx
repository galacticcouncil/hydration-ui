import {
  formatGhoReserveData,
  formatGhoUserData,
  FormattedGhoReserveData,
  FormattedGhoUserData,
  formatUserSummaryWithDiscount,
  USD_DECIMALS,
  UserReserveData,
} from "@aave/math-utils"
import { bigShift } from "@galacticcouncil/utils"
import { Big } from "big.js"
import React, { useContext } from "react"
import { useShallow } from "zustand/shallow"

import { EmodeCategory } from "@/helpers/types"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
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
import { ExternalApyData } from "@/types"
import { getUserApyValues } from "@/utils"
import {
  formatGhoReserve,
  GHO_SUPPORTED_MARKETS,
  GHO_SYMBOL,
  isGho,
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
  externalApyData: ExternalApyData
}

export const AppDataContext = React.createContext<AppDataContextType>(
  {} as AppDataContextType,
)

/**
 * This is the only provider you'll ever need.
 * It fetches reserves /incentives & walletbalances & keeps them updated.
 */
export const AppDataProvider: React.FC<{
  children: React.ReactNode
  externalApyData: ExternalApyData
}> = ({ children, externalApyData }) => {
  const currentTimestamp = useCurrentTimestamp(60)
  const { currentAccount } = useWeb3Context()
  const { currentMarket } = useProtocolDataContext()
  const { formatReserve } = useAppFormatters()

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
  ] = useRootStore(
    useShallow((state) => [
      selectCurrentReserves(state),
      selectCurrentBaseCurrencyData(state),
      selectCurrentUserReserves(state),
      selectCurrentUserEmodeCategoryId(state),
      selectEmodes(state, formatReserve),
      state.ghoReserveData,
      state.ghoUserData,
      state.ghoReserveDataFetched,
      selectFormattedReserves(state, currentTimestamp, externalApyData),
      selectUserSummaryAndIncentives(state, currentTimestamp, externalApyData),
    ]),
  )

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

  const formattedPoolReserves = formattedReserves.map((reserve) =>
    isGho(reserve)
      ? formatGhoReserve(reserve, formattedGhoReserveData)
      : formatReserve(reserve),
  )

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

    const marketReferenceCurrencyPriceInUsd = Big(
      baseCurrencyData?.marketReferenceCurrencyPriceInUsd || "0",
    )

    if (
      formattedGhoUserData.userDiscountedGhoInterest > 0 &&
      marketReferenceCurrencyPriceInUsd.gt(0)
    ) {
      const userSummaryWithDiscount = formatUserSummaryWithDiscount({
        userGhoDiscountedInterest:
          formattedGhoUserData.userDiscountedGhoInterest,
        user,
        marketReferenceCurrencyPriceUSD: bigShift(
          baseCurrencyData?.marketReferenceCurrencyPriceInUsd || "0",
          -USD_DECIMALS,
        ).toNumber(),
      })

      user = {
        ...user,
        ...userSummaryWithDiscount,
      }
    }
  }

  const isUserHasDeposits = user.userReservesData.some(
    (userReserve) => userReserve.scaledATokenBalance !== "0",
  )

  const userApyValues = getUserApyValues(
    user,
    formattedPoolReserves,
    formattedGhoUserData,
    formattedGhoReserveData,
  )

  return (
    <AppDataContext.Provider
      value={{
        loading: !reserves.length || (!!currentAccount && !userReserves.length),
        isConnected: !!currentAccount,
        reserves: formattedPoolReserves,
        eModes,
        user: {
          ...user,
          ...userApyValues,
          totalBorrowsUSD: user.totalBorrowsUSD,
          totalBorrowsMarketReferenceCurrency:
            user.totalBorrowsMarketReferenceCurrency,
          userEmodeCategoryId,
          isInEmode: userEmodeCategoryId !== 0,
          userReservesData: user.userReservesData
            .map((userReserve) => ({
              ...userReserve,
              reserve: formatReserve
                ? formatReserve(userReserve.reserve)
                : userReserve.reserve,
            }))
            .sort((a, b) => reserveSortFn(a.reserve, b.reserve)),
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
