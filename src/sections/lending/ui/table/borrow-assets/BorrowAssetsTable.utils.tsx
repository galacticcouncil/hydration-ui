import { API_ETH_MOCK_ADDRESS, InterestRate } from "@aave/contract-helpers"
import { USD_DECIMALS, valueToBigNumber } from "@aave/math-utils"
import { createColumnHelper } from "@tanstack/react-table"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Link } from "components/Link/Link"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"
import {
  DashboardReserve,
  handleSortDashboardReserves,
} from "sections/lending/utils/dashboardSortUtils"
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from "sections/lending/utils/getMaxAmountAvailableToBorrow"
import { findAndFilterGhoReserve } from "sections/lending/utils/ghoUtilities"

export type TBorrowAssetsTable = typeof useBorrowAssetsTableData
export type TBorrowAssetsTableData = ReturnType<TBorrowAssetsTable>
export type TBorrowAssetsRow = TBorrowAssetsTableData["data"][number]

const { accessor, display } = createColumnHelper<TBorrowAssetsRow>()

export const useBorrowAssetsTableColumns = () => {
  const { t } = useTranslation()
  const { openBorrow } = useModalContext()
  const { currentMarket } = useProtocolDataContext()

  return useMemo(
    () => [
      accessor("symbol", {
        header: "Symbol",
        cell: ({ row }) => {
          const { iconSymbol, underlyingAsset, symbol } = row.original
          return (
            <Link to={ROUTES.reserveOverview(underlyingAsset, currentMarket)}>
              <span sx={{ flex: "row", align: "center", gap: 8 }}>
                <TokenIcon symbol={iconSymbol} sx={{ fontSize: 24 }} />
                {symbol}
              </span>
            </Link>
          )
        },
      }),
      accessor("availableBorrows", {
        header: "Available",
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const { availableBorrows, availableBorrowsInUSD } = row.original
          const value = Number(availableBorrows)
          const valueUsd = Number(availableBorrowsInUSD)
          return (
            <span sx={{ color: value === 0 ? "basic500" : "white" }}>
              {t("value.token", { value })}
              {value > 0 && (
                <span
                  css={{ display: "block" }}
                  sx={{ color: "basic300", fontSize: 12, lineHeight: 16 }}
                >
                  <DisplayValue value={valueUsd} isUSD />
                </span>
              )}
            </span>
          )
        },
      }),
      accessor("variableBorrowRate", {
        header: "APY, Variable",
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const { variableBorrowRate, vIncentivesData, symbol } = row.original

          return (
            <IncentivesCard
              value={variableBorrowRate}
              incentives={vIncentivesData}
              symbol={symbol}
            />
          )
        },
      }),
      display({
        id: "actions",
        meta: {
          sx: {
            textAlign: "end",
          },
        },
        cell: ({ row }) => {
          const { isFreezed, availableBorrows, underlyingAsset } = row.original
          const disableBorrow = isFreezed || Number(availableBorrows) <= 0
          return (
            <div sx={{ flex: "row", justify: "end" }}>
              <Button
                disabled={disableBorrow}
                onClick={() => openBorrow(underlyingAsset)}
                size="micro"
              >
                Borrow
              </Button>
              <Link to={ROUTES.reserveOverview(underlyingAsset, currentMarket)}>
                <ChevronRight sx={{ color: "iconGray", mr: -8 }} />
              </Link>
            </div>
          )
        },
      }),
    ],
    [currentMarket, openBorrow, t],
  )
}

export const useBorrowAssetsTableData = () => {
  const { currentNetworkConfig, currentMarket } = useProtocolDataContext()
  const { user, reserves, marketReferencePriceInUsd, loading } =
    useAppDataContext()
  const [displayGho] = useRootStore((store) => [store.displayGho])

  const { baseAssetSymbol } = currentNetworkConfig

  const sortedReserves = useMemo(() => {
    const tokensToBorrow = reserves
      .filter((reserve) => assetCanBeBorrowedByUser(reserve, user))
      .map((reserve: ComputedReserveData) => {
        const availableBorrows = user
          ? Number(
              getMaxAmountAvailableToBorrow(
                reserve,
                user,
                InterestRate.Variable,
              ),
            )
          : 0

        const availableBorrowsInUSD = valueToBigNumber(availableBorrows)
          .multipliedBy(reserve.formattedPriceInMarketReferenceCurrency)
          .multipliedBy(marketReferencePriceInUsd)
          .shiftedBy(-USD_DECIMALS)
          .toFixed(2)

        return {
          ...reserve,
          reserve,
          totalBorrows: reserve.totalDebt,
          availableBorrows,
          availableBorrowsInUSD,
          stableBorrowRate:
            reserve.stableBorrowRateEnabled && reserve.borrowingEnabled
              ? Number(reserve.stableBorrowAPY)
              : -1,
          variableBorrowRate: reserve.borrowingEnabled
            ? Number(reserve.variableBorrowAPY)
            : -1,
          ...(reserve.isWrappedBaseAsset
            ? fetchIconSymbolAndName({
                symbol: baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              })
            : {}),
        }
      })

    const maxBorrowAmount = valueToBigNumber(
      user?.totalBorrowsMarketReferenceCurrency || "0",
    ).plus(user?.availableBorrowsMarketReferenceCurrency || "0")
    const collateralUsagePercent = maxBorrowAmount.eq(0)
      ? "0"
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || "0")
          .div(maxBorrowAmount)
          .toFixed()

    const borrowReserves =
      user?.totalCollateralMarketReferenceCurrency === "0" ||
      +collateralUsagePercent >= 0.98
        ? tokensToBorrow
        : tokensToBorrow.filter(
            ({ availableBorrowsInUSD, totalLiquidityUSD, symbol }) => {
              if (displayGho({ symbol, currentMarket })) {
                return true
              }

              return (
                availableBorrowsInUSD !== "0.00" && totalLiquidityUSD !== "0"
              )
            },
          )

    const { filtered: filteredReserves } =
      findAndFilterGhoReserve(borrowReserves)

    const sortedReserves = handleSortDashboardReserves(
      false,
      "",
      "asset",
      filteredReserves as unknown as DashboardReserve[],
    )

    return sortedReserves
  }, [
    baseAssetSymbol,
    currentMarket,
    displayGho,
    marketReferencePriceInUsd,
    reserves,
    user,
  ])

  return {
    data: sortedReserves,
    isLoading: loading,
  }
}
