import { USD_DECIMALS, valueToBigNumber } from "@aave/math-utils"
import { createColumnHelper } from "@tanstack/react-table"
import ChevronRight from "assets/icons/ChevronRight.svg?react"
import BigNumber from "bignumber.js"
import { Button } from "components/Button/Button"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Link } from "components/Link/Link"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ROUTES } from "sections/lending/components/primitives/Link"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useWalletBalances } from "sections/lending/hooks/app-data-provider/useWalletBalances"
import { getAssetCapData } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { AssetNameColumn } from "sections/lending/ui/columns/AssetNameColumn"
import { CollateralColumn } from "sections/lending/ui/columns/CollateralColumn"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { DashboardReserve } from "sections/lending/utils/dashboard"
import { MONEY_MARKET_GIGA_RESERVES } from "sections/lending/ui-config/misc"
import { OverrideApy } from "sections/pools/stablepool/components/GigaIncentives"
import { getAssetIdFromAddress } from "utils/evm"
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import { NoData } from "sections/lending/components/primitives/NoData"
import { useAssets } from "providers/assets"

export type TSupplyAssetsTable = typeof useSupplyAssetsTableData
export type TSupplyAssetsTableData = ReturnType<TSupplyAssetsTable>
export type TSupplyAssetsRow = TSupplyAssetsTableData["data"][number]

type TSupplyAsset = ComputedReserveData & {
  reserve: ComputedReserveData
  walletBalance: string
  walletBalanceUSD: string
  availableToDeposit: string

  availableToDepositUSD: string

  usageAsCollateralEnabledOnUser: boolean
  detailsAddress: string
}

const columnHelper = createColumnHelper<TSupplyAssetsRow>()

export const useSupplyAssetsTableColumns = () => {
  const { t } = useTranslation()
  const { openSupply } = useModalContext()
  const { currentMarket } = useProtocolDataContext()

  const { isBound } = useEvmAccount()

  return useMemo(
    () => [
      columnHelper.accessor("symbol", {
        header: t("lending.asset"),
        cell: ({ row }) => (
          <AssetNameColumn
            detailsAddress={row.original.detailsAddress}
            symbol={row.original.symbol}
          />
        ),
      }),
      columnHelper.accessor("walletBalanceUSD", {
        header: t("lending.balance"),
        meta: {
          sx: {
            textAlign: "right",
          },
        },
        sortingFn: (a, b) =>
          Number(a.original.walletBalanceUSD) -
          Number(b.original.walletBalanceUSD),
        cell: ({ row }) => {
          const { walletBalance, walletBalanceUSD } = row.original
          const value = Number(walletBalance ?? 0)
          const valueUsd = Number(walletBalanceUSD ?? 0)

          const { supplyCap } = getAssetCapData(row.original.reserve)
          const isMaxCapReached = supplyCap.isMaxed

          const disabled = value === 0 || isMaxCapReached

          if (!isBound) return <NoData />

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
      columnHelper.accessor("supplyAPY", {
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
              type="supply"
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
      columnHelper.accessor("usageAsCollateralEnabledOnUser", {
        header: t("lending.supply.table.canBeCollateral"),
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
                <></>
              ) : (
                <CollateralColumn
                  isIsolated={isIsolated}
                  usageAsCollateralEnabled={usageAsCollateralEnabledOnUser}
                />
              )}
            </>
          )
        },
      }),
      columnHelper.display({
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
            detailsAddress,
          } = row.original

          const { supplyCap } = getAssetCapData(row.original.reserve)
          const isMaxCapReached = supplyCap.isMaxed

          const disableSupply =
            !isBound ||
            !isActive ||
            isPaused ||
            isFreezed ||
            Number(walletBalance ?? 0) <= 0 ||
            isMaxCapReached
          return (
            <div sx={{ flex: "row", align: "center", justify: "end" }}>
              <Button
                disabled={disableSupply}
                sx={{ height: "100%" }}
                onClick={() => openSupply(underlyingAsset)}
                size="micro"
              >
                {t("lending.supply")}
              </Button>
              <Link
                to={ROUTES.reserveOverview(
                  detailsAddress || underlyingAsset,
                  currentMarket,
                )}
              >
                <ChevronRight sx={{ color: "iconGray", mr: -8 }} />
              </Link>
            </div>
          )
        },
      }),
    ],
    [isBound, currentMarket, openSupply, t],
  )
}

export const useSupplyAssetsTableData = ({ showAll }: { showAll: boolean }) => {
  const displayGho = useRootStore((store) => store.displayGho)
  const { getAsset } = useAssets()
  const { currentMarket, currentMarketData } = useProtocolDataContext()
  const {
    user,
    reserves,
    marketReferencePriceInUsd,
    loading: loadingReserves,
  } = useAppDataContext()
  const { walletBalances, loading } = useWalletBalances(currentMarketData)

  const { gigaReserves, supplyReserves } = useMemo(() => {
    const { tokensToSupply, gigaReserves } = reserves
      .filter(
        (reserve: ComputedReserveData) =>
          !displayGho({ currentMarket, symbol: reserve.symbol }) &&
          !(reserve.isFrozen || reserve.isPaused),
      )
      .reduce<{
        tokensToSupply: TSupplyAsset[]
        gigaReserves: ComputedReserveData[]
      }>(
        (acc, reserve: ComputedReserveData) => {
          const walletBalance = walletBalances[reserve.underlyingAsset]?.amount
          const walletBalanceUSD =
            walletBalances[reserve.underlyingAsset]?.amountUSD

          let availableToDeposit = valueToBigNumber(walletBalance)

          if (MONEY_MARKET_GIGA_RESERVES.includes(reserve.underlyingAsset)) {
            acc.gigaReserves.push(reserve)

            if (availableToDeposit.isNaN() || availableToDeposit.isZero())
              return acc
          }

          if (reserve.supplyCap !== "0") {
            availableToDeposit = availableToDeposit.isNaN()
              ? new BigNumber(0)
              : BigNumber.min(
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

          const isGigaAsset = MONEY_MARKET_GIGA_RESERVES.includes(
            reserve.underlyingAsset,
          )

          // display share token name and symbol for giga assets in the supply table
          const gigaAssetMeta = isGigaAsset
            ? getAsset(getAssetIdFromAddress(reserve.underlyingAsset))
            : undefined

          acc.tokensToSupply.push({
            ...reserve,
            symbol: gigaAssetMeta?.symbol || reserve.symbol,
            name: gigaAssetMeta?.name || reserve.name,
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
          })

          return acc
        },
        { tokensToSupply: [], gigaReserves: [] },
      )

    const sortedSupplyReserves = tokensToSupply.sort((a, b) =>
      +a.walletBalanceUSD > +b.walletBalanceUSD ? -1 : 1,
    )

    const filteredSupplyReserves = sortedSupplyReserves.filter((reserve) =>
      valueToBigNumber(reserve.availableToDepositUSD).gt(0),
    )

    // Filter out reserves
    const supplyReserves: unknown = showAll
      ? sortedSupplyReserves
      : filteredSupplyReserves.length >= 1
        ? filteredSupplyReserves
        : sortedSupplyReserves

    return { supplyReserves, gigaReserves } as {
      supplyReserves: DashboardReserve[]
      gigaReserves: ComputedReserveData[]
    }
  }, [
    currentMarket,
    displayGho,
    getAsset,
    marketReferencePriceInUsd,
    reserves,
    showAll,
    user?.isInIsolationMode,
    user?.userReservesData,
    walletBalances,
  ])

  const isLoading = loadingReserves || loading

  return {
    data: supplyReserves,
    gigaReserves,
    isLoading,
  }
}
