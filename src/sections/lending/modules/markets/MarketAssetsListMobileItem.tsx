import { Box, Button, Divider } from "@mui/material"
import { VariableAPYTooltip } from "sections/lending/components/infoTooltips/VariableAPYTooltip"
import { NoData } from "sections/lending/components/primitives/NoData"
import { ReserveSubheader } from "sections/lending/components/ReserveSubheader"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"

import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { Row } from "sections/lending/components/primitives/Row"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { ListMobileItemWrapper } from "sections/lending/modules/dashboard/lists/ListMobileItemWrapper"

export const MarketAssetsListMobileItem = ({
  ...reserve
}: ComputedReserveData) => {
  const { currentMarket } = useProtocolDataContext()

  return (
    <ListMobileItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
      isIsolated={reserve.isIsolated}
    >
      <Row
        caption={<span>Total supplied</span>}
        captionVariant="description"
        mb={3}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "flex-end" },
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          <FormattedNumber
            compact
            value={reserve.totalLiquidity}
            variant="secondary14"
          />
          <ReserveSubheader
            value={reserve.totalLiquidityUSD}
            rightAlign={true}
          />
        </Box>
      </Row>
      <Row
        caption={<span>Supply APY</span>}
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <IncentivesCard
          align="flex-end"
          value={reserve.supplyAPY}
          incentives={reserve.aIncentivesData || []}
          symbol={reserve.symbol}
          variant="secondary14"
        />
      </Row>

      <Divider sx={{ mb: 3 }} />

      <Row
        caption={<span>Total borrowed</span>}
        captionVariant="description"
        mb={3}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "flex-end" },
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {Number(reserve.totalDebt) > 0 ? (
            <>
              <FormattedNumber
                compact
                value={reserve.totalDebt}
                variant="secondary14"
              />
              <ReserveSubheader
                value={reserve.totalDebtUSD}
                rightAlign={true}
              />
            </>
          ) : (
            <NoData variant={"secondary14"} color="text.secondary" />
          )}
        </Box>
      </Row>
      <Row
        caption={
          <VariableAPYTooltip
            text={<span>Borrow APY, variable</span>}
            key="APY_list_mob_variable_type"
            variant="description"
          />
        }
        captionVariant="description"
        mb={3}
        align="flex-start"
      >
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          <IncentivesCard
            align="flex-end"
            value={
              Number(reserve.totalVariableDebtUSD) > 0
                ? reserve.variableBorrowAPY
                : "-1"
            }
            incentives={reserve.vIncentivesData || []}
            symbol={reserve.symbol}
            variant="secondary14"
          />
          {!reserve.borrowingEnabled &&
            Number(reserve.totalVariableDebt) > 0 &&
            !reserve.isFrozen && <ReserveSubheader value={"Disabled"} />}
        </Box>
      </Row>
      {/* <Row
        caption={
          <StableAPYTooltip
            text={<span>Borrow APY, stable</span>}
            key="APY_list_mob_stable_type"
            variant="description"
          />
        }
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <IncentivesCard
            align="flex-end"
            value={Number(reserve.totalStableDebtUSD) > 0 ? reserve.stableBorrowAPY : '-1'}
            incentives={reserve.sIncentivesData || []}
            symbol={reserve.symbol}
            variant="secondary14"
          />
          {!reserve.borrowingEnabled &&
            Number(reserve.totalStableDebt) > 0 &&
            !reserve.isFrozen && <ReserveSubheader value={'Disabled'} />}
        </Box>
      </Row> */}

      <Button
        variant="outlined"
        component={Link}
        href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
        fullWidth
      >
        <span>View details</span>
      </Button>
    </ListMobileItemWrapper>
  )
}
