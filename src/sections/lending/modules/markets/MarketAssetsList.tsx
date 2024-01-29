import { useMediaQuery } from "@mui/material"
import { useState } from "react"
import { VariableAPYTooltip } from "sections/lending/components/infoTooltips/VariableAPYTooltip"
import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListHeaderTitle } from "sections/lending/components/lists/ListHeaderTitle"
import { ListHeaderWrapper } from "sections/lending/components/lists/ListHeaderWrapper"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

import { MarketAssetsListItem } from "./MarketAssetsListItem"
import { MarketAssetsListItemLoader } from "./MarketAssetsListItemLoader"
import { MarketAssetsListMobileItem } from "./MarketAssetsListMobileItem"
import { MarketAssetsListMobileItemLoader } from "./MarketAssetsListMobileItemLoader"

const listHeaders = [
  {
    title: <span>Asset</span>,
    sortKey: "symbol",
  },
  {
    title: <span>Total supplied</span>,
    sortKey: "totalLiquidityUSD",
  },
  {
    title: <span>Supply APY</span>,
    sortKey: "supplyAPY",
  },
  {
    title: <span>Total borrowed</span>,
    sortKey: "totalDebtUSD",
  },
  {
    title: (
      <VariableAPYTooltip
        text={<span>Borrow APY, variable</span>}
        key="APY_list_variable_type"
        variant="subheader2"
      />
    ),
    sortKey: "variableBorrowAPY",
  },
  // {
  //   title: (
  //     <StableAPYTooltip
  //       text={<span>Borrow APY, stable</span>}
  //       key="APY_list_stable_type"
  //       variant="subheader2"
  //     />
  //   ),
  //   sortKey: 'stableBorrowAPY',
  // },
]

type MarketAssetsListProps = {
  reserves: ComputedReserveData[]
  loading: boolean
}

export default function MarketAssetsList({
  reserves,
  loading,
}: MarketAssetsListProps) {
  const isTableChangedToCards = useMediaQuery("(max-width:1125px)")
  const [sortName, setSortName] = useState("")
  const [sortDesc, setSortDesc] = useState(false)
  if (sortDesc) {
    if (sortName === "symbol") {
      reserves.sort((a, b) =>
        a.symbol.toUpperCase() < b.symbol.toUpperCase() ? -1 : 1,
      )
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reserves.sort((a, b) => a[sortName] - b[sortName])
    }
  } else {
    if (sortName === "symbol") {
      reserves.sort((a, b) =>
        b.symbol.toUpperCase() < a.symbol.toUpperCase() ? -1 : 1,
      )
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      reserves.sort((a, b) => b[sortName] - a[sortName])
    }
  }

  // Show loading state when loading
  if (loading) {
    return isTableChangedToCards ? (
      <>
        <MarketAssetsListMobileItemLoader />
        <MarketAssetsListMobileItemLoader />
        <MarketAssetsListMobileItemLoader />
      </>
    ) : (
      <>
        <MarketAssetsListItemLoader />
        <MarketAssetsListItemLoader />
        <MarketAssetsListItemLoader />
        <MarketAssetsListItemLoader />
      </>
    )
  }

  // Hide list when no results, via search term or if a market has all/no frozen/unfrozen assets
  if (reserves.length === 0) return null

  return (
    <>
      {!isTableChangedToCards && (
        <ListHeaderWrapper px={6}>
          {listHeaders.map((col) => (
            <ListColumn
              isRow={col.sortKey === "symbol"}
              maxWidth={col.sortKey === "symbol" ? 280 : undefined}
              key={col.sortKey}
            >
              <ListHeaderTitle
                sortName={sortName}
                sortDesc={sortDesc}
                setSortName={setSortName}
                setSortDesc={setSortDesc}
                sortKey={col.sortKey}
                source="Markets Page"
              >
                {col.title}
              </ListHeaderTitle>
            </ListColumn>
          ))}
          <ListColumn maxWidth={95} minWidth={95} />
        </ListHeaderWrapper>
      )}

      {reserves.map((reserve) =>
        isTableChangedToCards ? (
          <MarketAssetsListMobileItem {...reserve} key={reserve.id} />
        ) : (
          <MarketAssetsListItem {...reserve} key={reserve.id} />
        ),
      )}
    </>
  )
}
