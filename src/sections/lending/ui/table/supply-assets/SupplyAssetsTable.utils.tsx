import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import { USD_DECIMALS, valueToBigNumber } from "@aave/math-utils"
import { createColumnHelper } from "@tanstack/react-table"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Link } from "components/Link/Link"
import { useEffect, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { NoData } from "sections/lending/components/primitives/NoData"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useWalletBalances } from "sections/lending/hooks/app-data-provider/useWalletBalances"
import { getAssetCapData } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { ListItemCanBeCollateral } from "sections/lending/modules/dashboard/lists/ListItemCanBeCollateral"
import { useRootStore } from "sections/lending/store/root"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"
import {
  DashboardReserve,
  handleSortDashboardReserves,
} from "sections/lending/utils/dashboardSortUtils"

export type TSupplyAssetsTable = typeof useSupplyAssetsTableData
export type TSupplyAssetsTableData = ReturnType<TSupplyAssetsTable>
export type TSupplyAssetsRow = TSupplyAssetsTableData["data"][number]

const { accessor, display } = createColumnHelper<TSupplyAssetsRow>()

export const useSupplyAssetsTableColumns = () => {
  const { t } = useTranslation()
  const { openSupply } = useModalContext()
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
      accessor("walletBalanceUSD", {
        header: "Wallet balance",
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const { walletBalance, walletBalanceUSD } = row.original
          const value = Number(walletBalance)
          const valueUsd = Number(walletBalanceUSD)

          const { supplyCap } = getAssetCapData(row.original.reserve)
          const isMaxCapReached = supplyCap.isMaxed

          const disabled = value === 0 || isMaxCapReached
          return (
            <span sx={{ color: disabled ? "basic500" : "white" }}>
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
      accessor("usageAsCollateralEnabledOnUser", {
        header: "Can be collateral",
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const { isIsolated, usageAsCollateralEnabledOnUser } = row.original
          const { debtCeiling } = getAssetCapData(row.original.reserve)
          return (
            <>
              {debtCeiling.isMaxed ? (
                <NoData variant="main14" color="text.secondary" />
              ) : (
                <ListItemCanBeCollateral
                  isIsolated={isIsolated}
                  usageAsCollateralEnabled={usageAsCollateralEnabledOnUser}
                />
              )}
            </>
          )
        },
      }),
      accessor("supplyAPY", {
        header: "APY",
        meta: {
          sx: {
            textAlign: "center",
          },
        },
        cell: ({ row }) => {
          const { supplyAPY, aIncentivesData, symbol } = row.original

          return (
            <IncentivesCard
              value={supplyAPY}
              incentives={aIncentivesData}
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
          const {
            isActive,
            isPaused,
            walletBalance,
            isFreezed,
            underlyingAsset,
          } = row.original

          const { supplyCap } = getAssetCapData(row.original.reserve)
          const isMaxCapReached = supplyCap.isMaxed

          const disableSupply =
            !isActive ||
            isPaused ||
            isFreezed ||
            Number(walletBalance) <= 0 ||
            isMaxCapReached
          return (
            <div sx={{ flex: "row", justify: "end" }}>
              <Button
                disabled={disableSupply}
                onClick={() => openSupply(underlyingAsset)}
                size="micro"
              >
                Supply
              </Button>
              <Link to={ROUTES.reserveOverview(underlyingAsset, currentMarket)}>
                <ChevronRight sx={{ color: "iconGray", mr: -8 }} />
              </Link>
            </div>
          )
        },
      }),
    ],
    [currentMarket, openSupply, t],
  )
}

export const useSupplyAssetsTableData = () => {
  const currentNetworkConfig = useRootStore(
    (store) => store.currentNetworkConfig,
  )
  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const currentMarket = useRootStore((store) => store.currentMarket)
  const {
    user,
    reserves,
    marketReferencePriceInUsd,
    loading: loadingReserves,
  } = useAppDataContext()
  const { walletBalances, loading } = useWalletBalances(currentMarketData)
  const [displayGho] = useRootStore((store) => [store.displayGho])

  const { baseAssetSymbol } = currentNetworkConfig

  // @TODO: Remove this when the feature is implemented
  const isShowZeroAssets = true

  /* const localStorageName = "showSupplyZeroAssets"
  const [isShowZeroAssets, setIsShowZeroAssets] = useState(
    localStorage.getItem(localStorageName) === "true",
  ) */
  const sortedReserves = useMemo(() => {
    const tokensToSupply = reserves
      .filter(
        (reserve: ComputedReserveData) =>
          !(reserve.isFrozen || reserve.isPaused) &&
          !displayGho({ symbol: reserve.symbol, currentMarket }),
      )
      .map((reserve: ComputedReserveData) => {
        const walletBalance = walletBalances[reserve.underlyingAsset]?.amount
        const walletBalanceUSD =
          walletBalances[reserve.underlyingAsset]?.amountUSD
        let availableToDeposit = valueToBigNumber(walletBalance)
        if (reserve.supplyCap !== "0") {
          availableToDeposit = BigNumber.min(
            availableToDeposit,
            new BigNumber(reserve.supplyCap)
              .minus(reserve.totalLiquidity)
              .multipliedBy("0.995"),
          )
        }
        const availableToDepositUSD = valueToBigNumber(availableToDeposit)
          .multipliedBy(reserve.priceInMarketReferenceCurrency)
          .multipliedBy(marketReferencePriceInUsd)
          .shiftedBy(-USD_DECIMALS)
          .toString()

        const isIsolated = reserve.isIsolated
        const hasDifferentCollateral = user?.userReservesData.find(
          (userRes) =>
            userRes.usageAsCollateralEnabledOnUser &&
            userRes.reserve.id !== reserve.id,
        )

        const usageAsCollateralEnabledOnUser = !user?.isInIsolationMode
          ? reserve.reserveLiquidationThreshold !== "0" &&
            (!isIsolated || (isIsolated && !hasDifferentCollateral))
          : !isIsolated
          ? false
          : !hasDifferentCollateral

        if (reserve.isWrappedBaseAsset) {
          let baseAvailableToDeposit = valueToBigNumber(
            walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
          )
          if (reserve.supplyCap !== "0") {
            baseAvailableToDeposit = BigNumber.min(
              baseAvailableToDeposit,
              new BigNumber(reserve.supplyCap)
                .minus(reserve.totalLiquidity)
                .multipliedBy("0.995"),
            )
          }
          const baseAvailableToDepositUSD = valueToBigNumber(
            baseAvailableToDeposit,
          )
            .multipliedBy(reserve.priceInMarketReferenceCurrency)
            .multipliedBy(marketReferencePriceInUsd)
            .shiftedBy(-USD_DECIMALS)
            .toString()
          return [
            {
              ...reserve,
              reserve,
              underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              ...fetchIconSymbolAndName({
                symbol: baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              }),
              walletBalance:
                walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amount,
              walletBalanceUSD:
                walletBalances[API_ETH_MOCK_ADDRESS.toLowerCase()]?.amountUSD,
              availableToDeposit: baseAvailableToDeposit.toString(),
              availableToDepositUSD: baseAvailableToDepositUSD,
              usageAsCollateralEnabledOnUser,
              detailsAddress: reserve.underlyingAsset,
              id: reserve.id + "base",
            },
            {
              ...reserve,
              reserve,
              walletBalance,
              walletBalanceUSD,
              availableToDeposit:
                availableToDeposit.toNumber() <= 0
                  ? "0"
                  : availableToDeposit.toString(),
              availableToDepositUSD:
                Number(availableToDepositUSD) <= 0
                  ? "0"
                  : availableToDepositUSD.toString(),
              usageAsCollateralEnabledOnUser,
              detailsAddress: reserve.underlyingAsset,
            },
          ]
        }

        return {
          ...reserve,
          reserve,
          walletBalance,
          walletBalanceUSD,
          availableToDeposit:
            availableToDeposit.toNumber() <= 0
              ? "0"
              : availableToDeposit.toString(),
          availableToDepositUSD:
            Number(availableToDepositUSD) <= 0
              ? "0"
              : availableToDepositUSD.toString(),
          usageAsCollateralEnabledOnUser,
          detailsAddress: reserve.underlyingAsset,
        }
      })
      .flat()

    const sortedSupplyReserves = tokensToSupply.sort((a, b) =>
      +a.walletBalanceUSD > +b.walletBalanceUSD ? -1 : 1,
    )
    const filteredSupplyReserves = sortedSupplyReserves.filter(
      (reserve) => reserve.availableToDepositUSD !== "0",
    )

    // Filter out reserves
    const supplyReserves: unknown = isShowZeroAssets
      ? sortedSupplyReserves
      : filteredSupplyReserves.length >= 1
      ? filteredSupplyReserves
      : sortedSupplyReserves

    // Transform to the DashboardReserve schema so the sort utils can work with it
    const preSortedReserves = supplyReserves as DashboardReserve[]
    return handleSortDashboardReserves(false, "", "assets", preSortedReserves)
  }, [
    baseAssetSymbol,
    currentMarket,
    displayGho,
    isShowZeroAssets,
    marketReferencePriceInUsd,
    reserves,
    user?.isInIsolationMode,
    user?.userReservesData,
    walletBalances,
  ])

  const isLoading = !!(loadingReserves || loading)

  /* useEffect(() => {
    console.log("currentMarketData", currentMarketData)
  }, [currentMarketData]) */

  return {
    data: sortedReserves,
    isLoading,
  }
}
