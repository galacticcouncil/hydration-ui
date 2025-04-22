import { useNavigate } from "@tanstack/react-location"
import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { NoData } from "sections/lending/components/primitives/NoData"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { AssetNameColumn } from "sections/lending/ui/columns/AssetNameColumn"
import { OverrideApy } from "sections/pools/stablepool/components/GDOTIncentives"
import { GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { getAssetIdFromAddress } from "utils/evm"
import { arraySearch } from "utils/helpers"

export type TSupplyAssetsTableData = ReturnType<typeof useAppDataContext>
export type TSupplyAssetsRow = TSupplyAssetsTableData["reserves"][number]

const { accessor, display } = createColumnHelper<TSupplyAssetsRow>()

export const useMarketAssetsTableColumns = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
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
      accessor("totalLiquidityUSD", {
        header: t("lending.market.table.totalSupplied"),
        meta: {
          sx: {
            textAlign: ["end", "start"],
          },
        },
        sortingFn: (a, b) =>
          Number(a.original.totalLiquidityUSD) -
          Number(b.original.totalLiquidityUSD),
        cell: ({ row }) => {
          const { totalLiquidityUSD, totalLiquidity } = row.original
          const value = Number(totalLiquidity)
          const valueUsd = Number(totalLiquidityUSD)
          return (
            <span>
              {t("value.compact", { value })}
              {value > 0 && (
                <span
                  css={{ display: "block" }}
                  sx={{ color: "basic300", fontSize: 12, lineHeight: 16 }}
                >
                  <DisplayValue compact value={valueUsd} isUSD />
                </span>
              )}
            </span>
          )
        },
      }),
      accessor("supplyAPY", {
        header: t("lending.apy"),
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const { supplyAPY, aIncentivesData, symbol } = row.original

          return (
            <OverrideApy
              assetId={getAssetIdFromAddress(row.original.underlyingAsset)}
            >
              <IncentivesCard
                value={supplyAPY}
                incentives={aIncentivesData}
                symbol={symbol}
              />
            </OverrideApy>
          )
        },
      }),
      accessor("totalDebtUSD", {
        header: t("lending.market.table.totalBorrowed"),
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        sortingFn: (a, b) =>
          Number(a.original.totalDebtUSD) - Number(b.original.totalDebtUSD),
        cell: ({ row }) => {
          const { totalDebtUSD, totalDebt, borrowingEnabled } = row.original

          const value = Number(totalDebt)
          const valueUsd = Number(totalDebtUSD)

          return (
            <>
              {borrowingEnabled || value > 0 ? (
                <span>
                  {t("value.compact", { value })}
                  {value > 0 && (
                    <span
                      css={{ display: "block" }}
                      sx={{ color: "basic300", fontSize: 12, lineHeight: 16 }}
                    >
                      <DisplayValue compact value={valueUsd} isUSD />
                    </span>
                  )}
                </span>
              ) : (
                <NoData />
              )}
            </>
          )
        },
      }),
      accessor("variableBorrowAPY", {
        header: t("lending.market.table.borrowApyVariable"),
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const {
            symbol,
            totalVariableDebt,
            totalVariableDebtUSD,
            variableBorrowAPY,
            vIncentivesData,
            borrowingEnabled,
            isFrozen,
            underlyingAsset,
          } = row.original

          const assetId = getAssetIdFromAddress(underlyingAsset)

          return (
            <>
              <OverrideApy
                assetId={
                  assetId === GDOT_STABLESWAP_ASSET_ID ? undefined : assetId
                }
                isSupply={false}
              >
                <IncentivesCard
                  value={
                    Number(totalVariableDebtUSD) > 0 ? variableBorrowAPY : "-1"
                  }
                  incentives={vIncentivesData || []}
                  symbol={symbol}
                />
              </OverrideApy>

              {!borrowingEnabled &&
                Number(totalVariableDebt) > 0 &&
                !isFrozen && (
                  <Text as="span" fs={12} color="basic500">
                    (Disabled)
                  </Text>
                )}
            </>
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
          const { underlyingAsset } = row.original
          return (
            <Button
              size="micro"
              css={{ minHeight: 27 }}
              onClick={() =>
                navigate({
                  to: ROUTES.reserveOverview(underlyingAsset, currentMarket),
                })
              }
            >
              {t("lending.details")}
            </Button>
          )
        },
      }),
    ],
    [currentMarket, navigate, t],
  )
}

export const useMarketAssetsTableData = ({
  search,
}: { search?: string } = {}) => {
  const displayGho = useRootStore((state) => state.displayGho)
  const { reserves, loading } = useAppDataContext()
  const { currentMarket } = useProtocolDataContext()

  const data = useMemo(() => {
    const data = reserves.filter((r) => {
      const isGho = displayGho({ symbol: r.symbol, currentMarket })
      return !isGho && r.isActive && !r.isFrozen && !r.isPaused
    })

    return search
      ? arraySearch(data, search, ["name", "symbol", "underlyingAsset"])
      : data
  }, [currentMarket, displayGho, reserves, search])

  return {
    data,
    isLoading: loading,
  }
}
