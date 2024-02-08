import { Button } from "@mui/material"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { DashboardReserve } from "sections/lending/utils/dashboardSortUtils"

import { CapsHint } from "sections/lending/components/caps/CapsHint"
import { CapType } from "sections/lending/components/caps/helper"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { ListAPRColumn } from "sections/lending/modules/dashboard/lists/ListAPRColumn"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListItemWrapper } from "sections/lending/modules/dashboard/lists/ListItemWrapper"
import { ListValueColumn } from "sections/lending/modules/dashboard/lists/ListValueColumn"

export const BorrowAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  availableBorrows,
  availableBorrowsInUSD,
  borrowCap,
  totalBorrows,
  variableBorrowRate,
  vIncentivesData,
  underlyingAsset,
  isFreezed,
}: DashboardReserve) => {
  const { openBorrow } = useModalContext()
  const { currentMarket } = useProtocolDataContext()

  const disableBorrow = isFreezed || Number(availableBorrows) <= 0

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={underlyingAsset}
      data-cy={`dashboardBorrowListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
    >
      <ListValueColumn
        symbol={symbol}
        value={Number(availableBorrows)}
        subValue={Number(availableBorrowsInUSD)}
        disabled={Number(availableBorrows) === 0}
        withTooltip={false}
        capsComponent={
          <CapsHint
            capType={CapType.borrowCap}
            capAmount={borrowCap}
            totalAmount={totalBorrows}
            withoutText
          />
        }
      />
      <ListAPRColumn
        value={Number(variableBorrowRate)}
        incentives={vIncentivesData}
        symbol={symbol}
      />
      {/* <ListAPRColumn
        value={Number(stableBorrowRate)}
        incentives={sIncentivesData}
        symbol={symbol}
      /> */}
      <ListButtonsColumn>
        <Button
          disabled={disableBorrow}
          variant="contained"
          onClick={() => {
            openBorrow(underlyingAsset)
          }}
        >
          <span>Borrow</span>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
        >
          <span>Details</span>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  )
}
