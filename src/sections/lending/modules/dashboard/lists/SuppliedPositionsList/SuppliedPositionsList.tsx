import { API_ETH_MOCK_ADDRESS } from "@aave/contract-helpers"
import { Typography, useMediaQuery, useTheme } from "@mui/material"
import { Fragment, useState } from "react"
import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListHeaderTitle } from "sections/lending/components/lists/ListHeaderTitle"
import { ListHeaderWrapper } from "sections/lending/components/lists/ListHeaderWrapper"
import { AssetCapsProvider } from "sections/lending/hooks/useAssetCaps"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { fetchIconSymbolAndName } from "sections/lending/ui-config/reservePatches"

import { CollateralSwitchTooltip } from "sections/lending/components/infoTooltips/CollateralSwitchTooltip"
import { CollateralTooltip } from "sections/lending/components/infoTooltips/CollateralTooltip"
import { TotalSupplyAPYTooltip } from "sections/lending/components/infoTooltips/TotalSupplyAPYTooltip"
import { ListWrapper } from "sections/lending/components/lists/ListWrapper"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { DashboardContentNoData } from "sections/lending/modules/dashboard/DashboardContentNoData"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListLoader } from "sections/lending/modules/dashboard/lists/ListLoader"
import { ListTopInfoItem } from "sections/lending/modules/dashboard/lists/ListTopInfoItem"
import {
  DASHBOARD_LIST_COLUMN_WIDTHS,
  DashboardReserve,
  handleSortDashboardReserves,
} from "sections/lending/utils/dashboardSortUtils"
import { SuppliedPositionsListItem } from "./SuppliedPositionsListItem"
import { SuppliedPositionsListMobileItem } from "./SuppliedPositionsListMobileItem"

const head = [
  {
    title: <span>Asset</span>,
    sortKey: "symbol",
  },
  {
    title: <span key="Balance">Balance</span>,
    sortKey: "underlyingBalance",
  },

  {
    title: <span key="APY">APY</span>,
    sortKey: "supplyAPY",
  },
  {
    title: (
      <CollateralSwitchTooltip
        text={<span>Collateral</span>}
        key="Collateral"
        variant="subheader2"
      />
    ),
    sortKey: "usageAsCollateralEnabledOnUser",
  },
]

export const SuppliedPositionsList = () => {
  const { user, loading } = useAppDataContext()
  const { currentNetworkConfig } = useProtocolDataContext()
  const theme = useTheme()
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"))
  const [sortName, setSortName] = useState("")
  const [sortDesc, setSortDesc] = useState(false)
  const [tooltipOpen, setTooltipOpen] = useState<boolean>(false)

  const suppliedPositions =
    user?.userReservesData
      .filter((userReserve) => userReserve.underlyingBalance !== "0")
      .map((userReserve) => ({
        ...userReserve,
        supplyAPY: userReserve.reserve.supplyAPY, // Note: added only for table sort
        reserve: {
          ...userReserve.reserve,
          ...(userReserve.reserve.isWrappedBaseAsset
            ? fetchIconSymbolAndName({
                symbol: currentNetworkConfig.baseAssetSymbol,
                underlyingAsset: API_ETH_MOCK_ADDRESS.toLowerCase(),
              })
            : {}),
        },
      })) || []

  // spanform to the DashboardReserve schema so the sort utils can work with it
  const preSortedReserves = suppliedPositions as DashboardReserve[]
  const sortedReserves = handleSortDashboardReserves(
    sortDesc,
    sortName,
    "position",
    preSortedReserves,
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
              source="Supplied Positions Dashboard"
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
      <ListLoader title="Your supplies" head={head.map((col) => col.title)} />
    )

  return (
    <ListWrapper
      tooltipOpen={tooltipOpen}
      titleComponent={
        <Typography component="div" variant="h3" sx={{ mr: 16 }}>
          <span>Your supplies</span>
        </Typography>
      }
      localStorageName="suppliedAssetsDashboardTableCollapse"
      noData={!sortedReserves.length}
      topInfo={
        <>
          {!!sortedReserves.length && (
            <>
              <ListTopInfoItem
                title="Balance"
                value={user?.totalLiquidityUSD || 0}
              />
              <ListTopInfoItem
                title="APY"
                value={user?.earnedAPY || 0}
                percent
                tooltip={<TotalSupplyAPYTooltip setOpen={setTooltipOpen} />}
              />
              <ListTopInfoItem
                title="Collateral"
                value={user?.totalCollateralUSD || 0}
                tooltip={<CollateralTooltip setOpen={setTooltipOpen} />}
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
            <Fragment key={item.underlyingAsset}>
              <AssetCapsProvider asset={item.reserve}>
                {downToXSM ? (
                  <SuppliedPositionsListMobileItem {...item} />
                ) : (
                  <SuppliedPositionsListItem {...item} />
                )}
              </AssetCapsProvider>
            </Fragment>
          ))}
        </>
      ) : (
        <DashboardContentNoData text={<span>Nothing supplied yet</span>} />
      )}
    </ListWrapper>
  )
}
