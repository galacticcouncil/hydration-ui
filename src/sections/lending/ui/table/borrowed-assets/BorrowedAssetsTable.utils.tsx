import { API_ETH_MOCK_ADDRESS, InterestRate } from "@aave/contract-helpers"
import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import {
  ComputedUserReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"
import { AssetNameColumn } from "sections/lending/ui/columns/AssetNameColumn"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"

export type TBorrowedAssetsTable = typeof useBorrowedAssetsTableData
export type TBorrowedAssetsTableData = ReturnType<TBorrowedAssetsTable>
export type TBorrowedAssetsRow = TBorrowedAssetsTableData["data"][number]

const { accessor, display } = createColumnHelper<TBorrowedAssetsRow>()

export const useBorrowedAssetsTableColumns = () => {
  const { t } = useTranslation()
  const { openRepay } = useModalContext()

  return useMemo(
    () => [
      accessor(({ reserve }) => reserve.symbol, {
        header: t("lending.asset"),
        cell: ({ row }) => (
          <AssetNameColumn
            detailsAddress={row.original.underlyingAsset}
            symbol={row.original.reserve.symbol}
          />
        ),
      }),
      accessor("totalBorrowsUSD", {
        header: t("lending.debt"),
        sortingFn: (a, b) =>
          Number(a.original.totalBorrowsUSD) -
          Number(b.original.totalBorrowsUSD),
        cell: ({ row }) => {
          const { totalBorrows, totalBorrowsUSD } = row.original
          const value = Number(totalBorrows)
          const valueUsd = Number(totalBorrowsUSD)

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
      accessor("borrowAPY", {
        header: t("lending.apy"),
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const { borrowAPY, incentives, reserve } = row.original

          return (
            <IncentivesCard
              value={borrowAPY}
              incentives={incentives}
              symbol={reserve.symbol}
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
          const { reserve, underlyingAsset, borrowRateMode } = row.original

          const disableRepay = !reserve.isActive || reserve.isPaused
          return (
            <Button
              disabled={disableRepay}
              onClick={() =>
                openRepay(underlyingAsset, borrowRateMode, reserve.isFrozen)
              }
              size="micro"
              sx={{ height: 27 }}
            >
              {t("lending.repay")}
            </Button>
          )
        },
      }),
    ],
    [openRepay, t],
  )
}

export const useBorrowedAssetsTableData = () => {
  const { user, loading } = useAppDataContext()
  const { currentNetworkConfig } = useProtocolDataContext()

  const { isBound } = useEvmAccount()

  const data = useMemo(() => {
    if (!isBound) return []
    const borrowPositions =
      user?.userReservesData.reduce(
        (acc, userReserve) => {
          if (userReserve.variableBorrows !== "0") {
            acc.push({
              ...userReserve,
              borrowRateMode: InterestRate.Variable,
              reserve: {
                ...userReserve.reserve,
                ...(userReserve.reserve.isWrappedBaseAsset
                  ? fetchIconSymbolAndName({
                      symbol: currentNetworkConfig.baseAssetSymbol,
                      underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                    })
                  : {}),
              },
            })
          }
          if (userReserve.stableBorrows !== "0") {
            acc.push({
              ...userReserve,
              borrowRateMode: InterestRate.Stable,
              reserve: {
                ...userReserve.reserve,
                ...(userReserve.reserve.isWrappedBaseAsset
                  ? fetchIconSymbolAndName({
                      symbol: currentNetworkConfig.baseAssetSymbol,
                      underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
                    })
                  : {}),
              },
            })
          }
          return acc
        },
        [] as (ComputedUserReserveData & { borrowRateMode: InterestRate })[],
      ) || []

    return borrowPositions.map((item) => {
      return {
        ...item,
        totalBorrows:
          item.borrowRateMode === InterestRate.Variable
            ? item.variableBorrows
            : item.stableBorrows,
        totalBorrowsUSD:
          item.borrowRateMode === InterestRate.Variable
            ? item.variableBorrowsUSD
            : item.stableBorrowsUSD,
        borrowAPY:
          item.borrowRateMode === InterestRate.Variable
            ? Number(item.reserve.variableBorrowAPY)
            : Number(item.stableBorrowAPY),
        incentives:
          item.borrowRateMode === InterestRate.Variable
            ? item.reserve.vIncentivesData
            : item.reserve.sIncentivesData,
      }
    })
  }, [isBound, currentNetworkConfig.baseAssetSymbol, user?.userReservesData])

  return {
    data,
    isLoading: loading,
  }
}
