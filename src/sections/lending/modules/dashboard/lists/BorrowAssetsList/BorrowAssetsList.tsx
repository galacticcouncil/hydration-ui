import { API_ETH_MOCK_ADDRESS, InterestRate } from "@aave/contract-helpers"
import { USD_DECIMALS, valueToBigNumber } from "@aave/math-utils"
import { Box, Typography, useMediaQuery, useTheme } from "@mui/material"
import { Fragment, useState } from "react"
import { VariableAPYTooltip } from "sections/lending/components/infoTooltips/VariableAPYTooltip"
import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListHeaderTitle } from "sections/lending/components/lists/ListHeaderTitle"
import { ListHeaderWrapper } from "sections/lending/components/lists/ListHeaderWrapper"
import { Warning } from "sections/lending/components/primitives/Warning"
import { MarketWarning } from "sections/lending/components/transactions/Warnings/MarketWarning"
import { AssetCapsProvider } from "sections/lending/hooks/useAssetCaps"
import { useRootStore } from "sections/lending/store/root"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"
import { findAndFilterGhoReserve } from "sections/lending/utils/ghoUtilities"

import { CapType } from "sections/lending/components/caps/helper"
import { AvailableTooltip } from "sections/lending/components/infoTooltips/AvailableTooltip"
import { ListWrapper } from "sections/lending/components/lists/ListWrapper"
import { Link } from "sections/lending/components/primitives/Link"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from "sections/lending/utils/dashboardSortUtils"
import {
  assetCanBeBorrowedByUser,
  getMaxAmountAvailableToBorrow,
} from "sections/lending/utils/getMaxAmountAvailableToBorrow"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListLoader } from "sections/lending/modules/dashboard/lists/ListLoader"
import { BorrowAssetsListItem } from "./BorrowAssetsListItem"
import { BorrowAssetsListMobileItem } from "./BorrowAssetsListMobileItem"
import { GhoBorrowAssetsListItem } from "./GhoBorrowAssetsListItem"

const head = [
  {
    title: <span>Asset</span>,
    sortKey: "symbol",
  },
  {
    title: (
      <AvailableTooltip
        capType={CapType.borrowCap}
        text={<span>Available</span>}
        key="availableBorrows"
        variant="subheader2"
      />
    ),
    sortKey: "availableBorrows",
  },

  {
    title: (
      <VariableAPYTooltip
        text={<span>APY, variable</span>}
        key="variableBorrowAPY"
        variant="subheader2"
      />
    ),
    sortKey: "variableBorrowAPY",
  },
  // {
  //   title: (
  //     <StableAPYTooltip
  //       text={<span>APY, stable</span>}
  //       key="stableBorrowAPY"
  //       variant="subheader2"
  //     />
  //   ),
  //   sortKey: 'stableBorrowAPY',
  // },
]

export const BorrowAssetsList = () => {
  const { currentNetworkConfig, currentMarketData, currentMarket } =
    useProtocolDataContext()
  const { user, reserves, marketReferencePriceInUsd, loading } =
    useAppDataContext()
  const [displayGho] = useRootStore((store) => [store.displayGho])
  const theme = useTheme()
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"))
  const [sortName, setSortName] = useState("")
  const [sortDesc, setSortDesc] = useState(false)

  const { baseAssetSymbol } = currentNetworkConfig

  const tokensToBorrow = reserves
    .filter((reserve) => assetCanBeBorrowedByUser(reserve, user))
    .map((reserve: ComputedReserveData) => {
      const availableBorrows = user
        ? Number(
            getMaxAmountAvailableToBorrow(reserve, user, InterestRate.Variable),
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

            return availableBorrowsInUSD !== "0.00" && totalLiquidityUSD !== "0"
          },
        )

  const { value: ghoReserve, filtered: filteredReserves } =
    findAndFilterGhoReserve(borrowReserves)
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    "asset",
    filteredReserves as unknown as DashboardReserve[],
  )
  const borrowDisabled = !sortedReserves.length && !ghoReserve

  const RenderHeader: React.FC = () => {
    return (
      <ListHeaderWrapper>
        {head.map((col) => (
          <ListColumn
            isRow={col.sortKey === "symbol"}
            maxWidth={
              col.sortKey === "symbol"
                ? DASHBOARD_LIST_COLUMN_WIDTHS.ASSET
                : undefined
            }
            key={col.sortKey}
          >
            <ListHeaderTitle
              sortName={sortName}
              sortDesc={sortDesc}
              setSortName={setSortName}
              setSortDesc={setSortDesc}
              sortKey={col.sortKey}
              source={"Borrow Dashboard"}
            >
              {col.title}
            </ListHeaderTitle>
          </ListColumn>
        ))}
        <ListButtonsColumn isColumnHeader />
      </ListHeaderWrapper>
    )
  }

  if (loading)
    return (
      <ListLoader
        title={<span>Assets to borrow</span>}
        head={head.map((col) => col.title)}
        withTopMargin
      />
    )

  return (
    <ListWrapper
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 4 }}>
          <span>Assets to borrow</span>
        </Typography>
      }
      localStorageName="borrowAssetsDashboardTableCollapse"
      withTopMargin
      noData={borrowDisabled}
      subChildrenComponent={
        <>
          <Box sx={{ px: 6, mb: 4 }}>
            {borrowDisabled && currentNetworkConfig.name === "Harmony" && (
              <MarketWarning marketName="Harmony" />
            )}

            {borrowDisabled && currentNetworkConfig.name === "Fantom" && (
              <MarketWarning marketName="Fantom" />
            )}
            {borrowDisabled &&
              currentMarketData.marketTitle === "Ethereum AMM" && (
                <MarketWarning marketName="Ethereum AMM" />
              )}

            {user?.healthFactor !== "-1" &&
              Number(user?.healthFactor) <= 1.1 && (
                <Warning severity="error">
                  <span>
                    Be careful - You are very close to liquidation. Consider
                    depositing more collateral or paying down some of your
                    borrowed positions
                  </span>
                </Warning>
              )}

            {!borrowDisabled && (
              <>
                {user?.isInIsolationMode && (
                  <Warning severity="warning">
                    <span>
                      Borrowing power and assets are limited due to Isolation
                      mode.{" "}
                    </span>
                    <Link
                      href="https://docs.aave.com/faq/"
                      target="_blank"
                      rel="noopener"
                    >
                      Learn More
                    </Link>
                  </Warning>
                )}
                {user?.isInEmode && (
                  <Warning severity="warning">
                    <span>
                      In E-Mode some assets are not borrowable. Exit E-Mode to
                      get access to all assets
                    </span>
                  </Warning>
                )}
                {user?.totalCollateralMarketReferenceCurrency === "0" && (
                  <Warning severity="info">
                    <span>
                      To borrow you need to supply any asset to be used as
                      collateral.
                    </span>
                  </Warning>
                )}
              </>
            )}
          </Box>
          {ghoReserve &&
            !downToXSM &&
            displayGho({ symbol: ghoReserve.symbol, currentMarket }) && (
              <AssetCapsProvider asset={ghoReserve.reserve}>
                <GhoBorrowAssetsListItem {...ghoReserve} />
              </AssetCapsProvider>
            )}
        </>
      }
    >
      <>
        {!downToXSM && !!borrowReserves.length && <RenderHeader />}
        {ghoReserve &&
          downToXSM &&
          displayGho({ symbol: ghoReserve.symbol, currentMarket }) && (
            <AssetCapsProvider asset={ghoReserve.reserve}>
              <GhoBorrowAssetsListItem {...ghoReserve} />
            </AssetCapsProvider>
          )}
        {sortedReserves?.map((item) => (
          <Fragment key={item.underlyingAsset}>
            <AssetCapsProvider asset={item.reserve}>
              {downToXSM ? (
                <BorrowAssetsListMobileItem {...item} />
              ) : (
                <BorrowAssetsListItem {...item} />
              )}
            </AssetCapsProvider>
          </Fragment>
        ))}
      </>
    </ListWrapper>
  )
}
