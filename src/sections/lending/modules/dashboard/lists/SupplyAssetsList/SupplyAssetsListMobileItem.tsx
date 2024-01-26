import { Box, Button } from "@mui/material"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { DashboardReserve } from "sections/lending/utils/dashboardSortUtils"

import { CapsHint } from "sections/lending/components/caps/CapsHint"
import { CapType } from "sections/lending/components/caps/helper"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { Row } from "sections/lending/components/primitives/Row"
import { useModalContext } from "sections/lending/hooks/useModal"
import { ListItemCanBeCollateral } from "sections/lending/modules/dashboard/lists/ListItemCanBeCollateral"
import { ListMobileItemWrapper } from "sections/lending/modules/dashboard/lists/ListMobileItemWrapper"
import { ListValueRow } from "sections/lending/modules/dashboard/lists/ListValueRow"

export const SupplyAssetsListMobileItem = ({
  symbol,
  iconSymbol,
  name,
  walletBalance,
  walletBalanceUSD,
  supplyCap,
  totalLiquidity,
  supplyAPY,
  aIncentivesData,
  isIsolated,
  usageAsCollateralEnabledOnUser,
  isActive,
  isFreezed,
  underlyingAsset,
  detailsAddress,
  isPaused,
}: DashboardReserve) => {
  const { currentMarket } = useProtocolDataContext()
  const { openSupply } = useModalContext()

  // Disable the asset to prevent it from being supplied if supply cap has been reached
  const { supplyCap: supplyCapUsage } = useAssetCaps()
  const isMaxCapReached = supplyCapUsage.isMaxed

  const disableSupply =
    !isActive ||
    isPaused ||
    isFreezed ||
    Number(walletBalance) <= 0 ||
    isMaxCapReached

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
      showDebtCeilingTooltips
    >
      <ListValueRow
        title={<span>Supply balance</span>}
        value={Number(walletBalance)}
        subValue={walletBalanceUSD}
        disabled={Number(walletBalance) === 0 || isMaxCapReached}
        capsComponent={
          <CapsHint
            capType={CapType.supplyCap}
            capAmount={supplyCap}
            totalAmount={totalLiquidity}
            withoutText
          />
        }
      />

      <Row
        caption={<span>Supply APY</span>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(supplyAPY)}
          incentives={aIncentivesData}
          symbol={symbol}
          variant="secondary14"
        />
      </Row>

      <Row
        caption={<span>Can be collateral</span>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <ListItemCanBeCollateral
          isIsolated={isIsolated}
          usageAsCollateralEnabled={usageAsCollateralEnabledOnUser}
        />
      </Row>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 5,
        }}
      >
        <Button
          disabled={disableSupply}
          variant="contained"
          onClick={() =>
            openSupply(underlyingAsset, currentMarket, name, "dashboard")
          }
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <span>Supply</span>
        </Button>
        <Button
          variant="outlined"
          component={Link}
          href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
          fullWidth
        >
          <span>Details</span>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  )
}
