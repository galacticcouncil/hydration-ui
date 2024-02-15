import { Box, Button } from "@mui/material"
import { VariableAPYTooltip } from "sections/lending/components/infoTooltips/VariableAPYTooltip"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { DashboardReserve } from "sections/lending/utils/dashboardSortUtils"

import { CapsHint } from "sections/lending/components/caps/CapsHint"
import { CapType } from "sections/lending/components/caps/helper"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { Row } from "sections/lending/components/primitives/Row"
import { useModalContext } from "sections/lending/hooks/useModal"
import { ListMobileItemWrapper } from "sections/lending/modules/dashboard/lists/ListMobileItemWrapper"
import { ListValueRow } from "sections/lending/modules/dashboard/lists/ListValueRow"

export const BorrowAssetsListMobileItem = ({
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
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
    >
      <ListValueRow
        title="Available to borrow"
        value={Number(availableBorrows)}
        subValue={Number(availableBorrowsInUSD)}
        disabled={Number(availableBorrows) === 0}
        capsComponent={
          <CapsHint
            capType={CapType.borrowCap}
            capAmount={borrowCap}
            totalAmount={totalBorrows}
            withoutText
          />
        }
      />

      <Row
        caption={
          <VariableAPYTooltip
            text={<span>APY, variable</span>}
            key="APY_dash_mob_variable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(variableBorrowRate)}
          incentives={vIncentivesData}
          symbol={symbol}
          variant="secondary14"
        />
      </Row>

      {/* <Row
        caption={
          <StableAPYTooltip
            text={<span>APY, stable</span>}
            key="APY_dash_mob_stable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(stableBorrowRate)}
          incentives={sIncentivesData}
          symbol={symbol}
          variant="secondary14"
        />
      </Row> */}

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 5,
        }}
      >
        <Button
          disabled={disableBorrow}
          variant="contained"
          onClick={() =>
            openBorrow(underlyingAsset, currentMarket, name, "dashboard")
          }
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <span>Borrow</span>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
          fullWidth
        >
          <span>Details</span>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  )
}
