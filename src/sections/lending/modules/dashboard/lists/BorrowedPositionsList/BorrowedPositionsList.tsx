import { API_ETH_MOCK_ADDRESS, InterestRate } from "@aave/contract-helpers"
import { valueToBigNumber } from "@aave/math-utils"
import { Typography, useMediaQuery, useTheme } from "@mui/material"
import { useState } from "react"
import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListHeaderTitle } from "sections/lending/components/lists/ListHeaderTitle"
import { ListHeaderWrapper } from "sections/lending/components/lists/ListHeaderWrapper"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"
import { GHO_SYMBOL } from "sections/lending/utils/ghoUtilities"

import { APYTypeTooltip } from "sections/lending/components/infoTooltips/APYTypeTooltip"
import { BorrowPowerTooltip } from "sections/lending/components/infoTooltips/BorrowPowerTooltip"
import { TotalBorrowAPYTooltip } from "sections/lending/components/infoTooltips/TotalBorrowAPYTooltip"
import { ListWrapper } from "sections/lending/components/lists/ListWrapper"
import {
  ComputedUserReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { DashboardContentNoData } from "sections/lending/modules/dashboard/DashboardContentNoData"
import { DashboardEModeButton } from "sections/lending/modules/dashboard/DashboardEModeButton"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListLoader } from "sections/lending/modules/dashboard/lists/ListLoader"
import { ListTopInfoItem } from "sections/lending/modules/dashboard/lists/ListTopInfoItem"
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from "sections/lending/utils/dashboardSortUtils"
import { BorrowedPositionsListItemWrapper } from "./BorrowedPositionsListItemWrapper"

const head = [
  {
    title: <span>Asset</span>,
    sortKey: "symbol",
  },
  {
    title: <span key="Debt">Debt</span>,
    sortKey: "variableBorrows",
  },
  {
    title: <span key="APY">APY</span>,
    sortKey: "borrowAPY",
  },
  {
    title: (
      <APYTypeTooltip
        text={<span>APY type</span>}
        key="APY type"
        variant="subheader2"
      />
    ),
    sortKey: "typeAPY",
  },
]

export const BorrowedPositionsList = () => {
  const { user, loading, eModes } = useAppDataContext()
  const { currentMarketData, currentNetworkConfig } = useProtocolDataContext()
  const [sortName, setSortName] = useState("")
  const [sortDesc, setSortDesc] = useState(false)
  const theme = useTheme()
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"))
  const showEModeButton = currentMarketData.v3 && Object.keys(eModes).length > 1
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)

  let borrowPositions =
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

  // Move GHO to top of borrowed positions list
  const ghoReserve = borrowPositions.filter(
    (pos) => pos.reserve.symbol === GHO_SYMBOL,
  )
  if (ghoReserve.length > 0) {
    borrowPositions = borrowPositions.filter(
      (pos) => pos.reserve.symbol !== GHO_SYMBOL,
    )
    borrowPositions.unshift(ghoReserve[0])
  }

  const maxBorrowAmount = valueToBigNumber(
    user?.totalBorrowsMarketReferenceCurrency || "0",
  ).plus(user?.availableBorrowsMarketReferenceCurrency || "0")
  const collateralUsagePercent = maxBorrowAmount.eq(0)
    ? "0"
    : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || "0")
        .div(maxBorrowAmount)
        .toFixed()

  // spanform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = borrowPositions as DashboardReserve[]
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    "position",
    preSortedReserves,
    true,
  )

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
              source="Borrowed Positions Dashboard"
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
        title={<span>Your borrows</span>}
        head={head.map((c) => c.title)}
      />
    )

  return (
    <ListWrapper
      tooltipOpen={tooltipOpen}
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 16 }}>
          <span>Your borrows</span>
        </Typography>
      }
      localStorageName="borrowedAssetsDashboardTableCollapse"
      subTitleComponent={
        showEModeButton ? (
          <DashboardEModeButton
            userEmodeCategoryId={user.userEmodeCategoryId}
          />
        ) : undefined
      }
      noData={!sortedReserves.length}
      topInfo={
        <>
          {!!sortedReserves.length && (
            <>
              <ListTopInfoItem
                title={<span>Balance</span>}
                value={user?.totalBorrowsUSD || 0}
              />
              <ListTopInfoItem
                title={<span>APY</span>}
                value={user?.debtAPY || 0}
                percent
                tooltip={<TotalBorrowAPYTooltip setOpen={setTooltipOpen} />}
              />
              <ListTopInfoItem
                title={<span>Borrow power used</span>}
                value={collateralUsagePercent || 0}
                percent
                tooltip={<BorrowPowerTooltip setOpen={setTooltipOpen} />}
              />
            </>
          )}
        </>
      }
    >
      {sortedReserves.length ? (
        <>
          {!downToXSM && <RenderHeader />}
          {sortedReserves.map((item) => (
            <BorrowedPositionsListItemWrapper
              item={item}
              key={item.underlyingAsset + item.borrowRateMode}
            />
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<span>Nothing borrowed yet</span>} />
      )}
    </ListWrapper>
  )
}
