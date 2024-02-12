import { Box, Button, Typography } from "@mui/material"
import { OffboardingTooltip } from "sections/lending/components/infoTooltips/OffboardingToolTip"
import { RenFILToolTip } from "sections/lending/components/infoTooltips/RenFILToolTip"
import { IsolatedEnabledBadge } from "sections/lending/components/isolationMode/IsolatedBadge"
import { NoData } from "sections/lending/components/primitives/NoData"
import { ReserveSubheader } from "sections/lending/components/ReserveSubheader"
import { AssetsBeingOffboarded } from "sections/lending/components/Warnings/OffboardingWarning"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"

import { useNavigate } from "@tanstack/react-location"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { AMPLToolTip } from "sections/lending/components/infoTooltips/AMPLToolTip"
import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListItem } from "sections/lending/components/lists/ListItem"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

export const MarketAssetsListItem = ({ ...reserve }: ComputedReserveData) => {
  const { currentMarket } = useProtocolDataContext()

  const navigate = useNavigate()

  const offboardingDiscussion =
    AssetsBeingOffboarded[currentMarket]?.[reserve.symbol]

  return (
    <ListItem
      px={6}
      minHeight={76}
      onClick={() => {
        navigate({
          to: ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket),
        })
      }}
      sx={{ cursor: "pointer" }}
      button
      data-cy={`marketListItemListItem_${reserve.symbol.toUpperCase()}`}
    >
      <ListColumn isRow maxWidth={280}>
        <TokenIcon symbol={reserve.iconSymbol} fontSize="large" />
        <Box sx={{ pl: 3.5, overflow: "hidden" }}>
          <Typography variant="h4" noWrap>
            {reserve.name}
          </Typography>

          <Box
            sx={{
              p: { xs: "0", xsm: "3.625px 0px" },
            }}
          >
            <Typography variant="subheader2" color="text.muted" noWrap>
              {reserve.symbol}
              {reserve.isIsolated && (
                <span style={{ marginLeft: "8px" }}>
                  <IsolatedEnabledBadge />
                </span>
              )}
            </Typography>
          </Box>
        </Box>
        {reserve.symbol === "AMPL" && <AMPLToolTip />}
        {reserve.symbol === "renFIL" && <RenFILToolTip />}
        {offboardingDiscussion && (
          <OffboardingTooltip discussionLink={offboardingDiscussion} />
        )}
      </ListColumn>

      <ListColumn>
        <FormattedNumber
          compact
          value={reserve.totalLiquidity}
          variant="main16"
        />
        <ReserveSubheader value={reserve.totalLiquidityUSD} />
      </ListColumn>

      <ListColumn>
        <IncentivesCard
          value={reserve.supplyAPY}
          incentives={reserve.aIncentivesData || []}
          symbol={reserve.symbol}
          variant="main16"
          symbolsVariant="secondary16"
        />
      </ListColumn>

      <ListColumn>
        {reserve.borrowingEnabled || Number(reserve.totalDebt) > 0 ? (
          <>
            <FormattedNumber
              compact
              value={reserve.totalDebt}
              variant="main16"
            />{" "}
            <ReserveSubheader value={reserve.totalDebtUSD} />
          </>
        ) : (
          <NoData />
        )}
      </ListColumn>

      <ListColumn>
        <IncentivesCard
          value={
            Number(reserve.totalVariableDebtUSD) > 0
              ? reserve.variableBorrowAPY
              : "-1"
          }
          incentives={reserve.vIncentivesData || []}
          symbol={reserve.symbol}
          variant="main16"
          symbolsVariant="secondary16"
        />
        {!reserve.borrowingEnabled &&
          Number(reserve.totalVariableDebt) > 0 &&
          !reserve.isFrozen && <ReserveSubheader value={"Disabled"} />}
      </ListColumn>
      {/* 
      <ListColumn>
        <IncentivesCard
          value={Number(reserve.totalStableDebtUSD) > 0 ? reserve.stableBorrowAPY : '-1'}
          incentives={reserve.sIncentivesData || []}
          symbol={reserve.symbol}
          variant="main16"
          symbolsVariant="secondary16"
        />
        {!reserve.borrowingEnabled && Number(reserve.totalStableDebt) > 0 && !reserve.isFrozen && (
          <ReserveSubheader value={'Disabled'} />
        )}
      </ListColumn> */}

      <ListColumn minWidth={95} maxWidth={95} align="right">
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket)}
        >
          <span>Details</span>
        </Button>
      </ListColumn>
    </ListItem>
  )
}
