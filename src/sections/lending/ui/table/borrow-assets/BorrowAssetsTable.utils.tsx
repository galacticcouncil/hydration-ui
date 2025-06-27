import { API_ETH_MOCK_ADDRESS, InterestRate } from "@aave/contract-helpers"
import {
  FormattedGhoReserveData,
  USD_DECIMALS,
  valueToBigNumber,
} from "@aave/math-utils"
import { createColumnHelper } from "@tanstack/react-table"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Link } from "components/Link/Link"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { ROUTES } from "sections/lending/components/primitives/Link"
import {
  ComputedReserveData,
  ExtendedFormattedUser,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"
import { AssetNameColumn } from "sections/lending/ui/columns/AssetNameColumn"
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
  getMaxGhoMintAmount,
} from "sections/lending/utils/getMaxAmountAvailableToBorrow"
import { DashboardReserve } from "sections/lending/utils/dashboard"
import { OverrideApy } from "sections/pools/stablepool/components/GigaIncentives"
import { getAssetIdFromAddress } from "utils/evm"

export type TBorrowAssetsTable = typeof useBorrowAssetsTableData
export type TBorrowAssetsTableData = ReturnType<TBorrowAssetsTable>
export type TBorrowAssetsRow = TBorrowAssetsTableData["data"][number]

const { accessor, display } = createColumnHelper<TBorrowAssetsRow>()

export const useBorrowAssetsTableColumns = ({
  isGho,
}: { isGho?: boolean } = {}) => {
  const { t } = useTranslation()
  const { openBorrow } = useModalContext()
  const { currentMarket } = useProtocolDataContext()

  return useMemo(
    () => [
      accessor("symbol", {
        header: t("lending.asset"),
        cell: ({ row }) => (
          <AssetNameColumn
            detailsAddress={row.original.underlyingAsset}
            symbol={row.original.symbol}
          />
        ),
      }),
      accessor("availableBorrowsInUSD", {
        header: t("lending.available"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        sortingFn: (a, b) =>
          Number(a.original.availableBorrowsInUSD) -
          Number(b.original.availableBorrowsInUSD),
        cell: ({ row }) => {
          const { availableBorrows, availableBorrowsInUSD } = row.original
          const value = Number(availableBorrows ?? 0)
          const valueUsd = Number(availableBorrowsInUSD ?? 0)

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
        header: isGho ? t("lending.apyBorrowRate") : t("lending.apyVariable"),
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const { variableBorrowRate, vIncentivesData, symbol } = row.original

          return (
            <OverrideApy
              assetId={getAssetIdFromAddress(row.original.underlyingAsset)}
              type="borrow"
            >
              <IncentivesCard
                value={variableBorrowRate}
                incentives={vIncentivesData}
                symbol={symbol}
              />
            </OverrideApy>
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
            <div sx={{ flex: "row", align: "center", justify: "end" }}>
              <Button
                disabled={disableBorrow}
                onClick={() => openBorrow(underlyingAsset)}
                size="micro"
                sx={{ height: "100%" }}
              >
                {t("lending.borrow")}
              </Button>
              <Link to={ROUTES.reserveOverview(underlyingAsset, currentMarket)}>
                <ChevronRight sx={{ color: "iconGray", mr: -8 }} />
              </Link>
            </div>
          )
        },
      }),
    ],
    [currentMarket, isGho, openBorrow, t],
  )
}

export const useBorrowAssetsTableData = () => {
  const { currentNetworkConfig, currentMarket } = useProtocolDataContext()
  const { user, reserves, marketReferencePriceInUsd, ghoReserveData, loading } =
    useAppDataContext()
  const displayGho = useRootStore((store) => store.displayGho)
  const account = useRootStore((store) => store.account)

  const { baseAssetSymbol } = currentNetworkConfig
  const sortedReserves = useMemo(() => {
    const tokensToBorrow = reserves
      .filter((reserve) => assetCanBeBorrowedByUser(reserve, user))
      .map((reserve: ComputedReserveData) => {
        const isGho = displayGho({ symbol: reserve.symbol, currentMarket })
        const availableBorrows = account
          ? getAvailableBorrows(user, reserve, isGho ? ghoReserveData : null)
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
      !account ||
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

    return borrowReserves as unknown as DashboardReserve[]
  }, [
    account,
    baseAssetSymbol,
    currentMarket,
    displayGho,
    ghoReserveData,
    marketReferencePriceInUsd,
    reserves,
    user,
  ])

  return {
    data: sortedReserves,
    isLoading: loading,
  }
}

const getAvailableBorrows = (
  user: ExtendedFormattedUser,
  reserve: ComputedReserveData,
  ghoReserveData: FormattedGhoReserveData | null,
) => {
  return ghoReserveData
    ? Math.min(
        Number(getMaxGhoMintAmount(user, reserve)),
        ghoReserveData.aaveFacilitatorRemainingCapacity,
      )
    : Number(
        getMaxAmountAvailableToBorrow(reserve, user, InterestRate.Variable),
      )
}
