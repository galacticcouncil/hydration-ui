import { InterestRate } from "@aave/contract-helpers"
import { ReserveIncentiveResponse } from "@aave/math-utils/dist/esm/formatters/incentive/calculate-reserve-incentives"
import { Box, Button, useMediaQuery, useTheme } from "@mui/material"
import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { APYTypeTooltip } from "sections/lending/components/infoTooltips/APYTypeTooltip"
import { Row } from "sections/lending/components/primitives/Row"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { DashboardReserve } from "sections/lending/utils/dashboardSortUtils"
import { isFeatureEnabled } from "sections/lending/utils/marketsAndNetworksConfig"

import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListAPRColumn } from "sections/lending/modules/dashboard/lists/ListAPRColumn"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListItemAPYButton } from "sections/lending/modules/dashboard/lists/ListItemAPYButton"
import { ListItemWrapper } from "sections/lending/modules/dashboard/lists/ListItemWrapper"
import { ListMobileItemWrapper } from "sections/lending/modules/dashboard/lists/ListMobileItemWrapper"
import { ListValueColumn } from "sections/lending/modules/dashboard/lists/ListValueColumn"
import { ListValueRow } from "sections/lending/modules/dashboard/lists/ListValueRow"

export const BorrowedPositionsListItem = ({
  item,
}: {
  item: DashboardReserve
}) => {
  const { borrowCap } = useAssetCaps()
  const { currentMarketData } = useProtocolDataContext()
  const theme = useTheme()
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"))
  const { openBorrow, openRepay, openRateSwitch, openDebtSwitch } =
    useModalContext()

  const reserve = item.reserve

  const disableBorrow =
    !reserve.isActive ||
    !reserve.borrowingEnabled ||
    reserve.isFrozen ||
    reserve.isPaused ||
    borrowCap.isMaxed

  const disableRepay = !reserve.isActive || reserve.isPaused

  const showSwitchButton =
    isFeatureEnabled.debtSwitch(currentMarketData) || false
  const disableSwitch =
    reserve.isPaused || !reserve.isActive || reserve.symbol === "stETH"

  const props: BorrowedPositionsListItemProps = {
    ...item,
    disableBorrow,
    disableSwitch,
    disableRepay,
    showSwitchButton,
    totalBorrows:
      item.borrowRateMode === InterestRate.Variable
        ? item.variableBorrows
        : item.stableBorrows,
    totalBorrowsUSD:
      item.borrowRateMode === InterestRate.Variable
        ? item.variableBorrowsUSD
        : item.stableBorrowsUSD,
    borrowAPY:
      item.borrowRateMode === InterestRate.Variable
        ? Number(reserve.variableBorrowAPY)
        : Number(item.stableBorrowAPY),
    incentives:
      item.borrowRateMode === InterestRate.Variable
        ? reserve.vIncentivesData
        : reserve.sIncentivesData,
    onDetbSwitchClick: () => {
      openDebtSwitch(reserve.underlyingAsset, item.borrowRateMode)
    },
    onOpenBorrow: () => {
      openBorrow(reserve.underlyingAsset)
    },
    onOpenRepay: () => {
      openRepay(reserve.underlyingAsset, item.borrowRateMode, reserve.isFrozen)
    },
    onOpenRateSwitch: () => {
      openRateSwitch(reserve.underlyingAsset, item.borrowRateMode)
    },
  }

  if (downToXSM) {
    return <BorrowedPositionsListItemMobile {...props} />
  } else {
    return <BorrowedPositionsListItemDesktop {...props} />
  }
}

interface BorrowedPositionsListItemProps extends DashboardReserve {
  disableBorrow: boolean
  disableSwitch: boolean
  disableRepay: boolean
  showSwitchButton: boolean
  borrowAPY: number
  incentives: ReserveIncentiveResponse[] | undefined
  onDetbSwitchClick: () => void
  onOpenBorrow: () => void
  onOpenRepay: () => void
  onOpenRateSwitch: () => void
}

const BorrowedPositionsListItemDesktop = ({
  reserve,
  borrowRateMode,
  disableBorrow,
  disableSwitch,
  disableRepay,
  showSwitchButton,
  totalBorrows,
  totalBorrowsUSD,
  borrowAPY,
  incentives,
  onDetbSwitchClick,
  onOpenBorrow,
  onOpenRepay,
  onOpenRateSwitch,
}: BorrowedPositionsListItemProps) => {
  const { currentMarket } = useProtocolDataContext()

  const { isActive, isFrozen, isPaused, stableBorrowRateEnabled, name } =
    reserve

  return (
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={name}
      detailsAddress={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      paused={reserve.isPaused}
      borrowEnabled={reserve.borrowingEnabled}
      data-cy={`dashboardBorrowedListItem_${reserve.symbol.toUpperCase()}_${borrowRateMode}`}
      showBorrowCapTooltips
    >
      <ListValueColumn
        symbol={reserve.symbol}
        value={totalBorrows}
        subValue={totalBorrowsUSD}
      />

      <ListAPRColumn
        value={borrowAPY}
        incentives={incentives}
        symbol={reserve.symbol}
      />

      <ListColumn>
        <ListItemAPYButton
          stableBorrowRateEnabled={stableBorrowRateEnabled}
          borrowRateMode={borrowRateMode}
          disabled={
            !stableBorrowRateEnabled || isFrozen || !isActive || isPaused
          }
          onClick={onOpenRateSwitch}
          stableBorrowAPY={reserve.stableBorrowAPY}
          variableBorrowAPY={reserve.variableBorrowAPY}
          underlyingAsset={reserve.underlyingAsset}
          currentMarket={currentMarket}
        />
      </ListColumn>

      <ListButtonsColumn>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="contained"
            onClick={onDetbSwitchClick}
            data-cy={`swapButton`}
          >
            <span>Switch</span>
          </Button>
        ) : (
          <Button
            disabled={disableBorrow}
            variant="contained"
            onClick={onOpenBorrow}
          >
            <span>Borrow</span>
          </Button>
        )}
        <Button
          disabled={disableRepay}
          variant="outlined"
          onClick={onOpenRepay}
        >
          <span>Repay</span>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  )
}

const BorrowedPositionsListItemMobile = ({
  reserve,
  borrowRateMode,
  totalBorrows,
  totalBorrowsUSD,
  disableBorrow,
  showSwitchButton,
  disableSwitch,
  borrowAPY,
  incentives,
  disableRepay,
  onDetbSwitchClick,
  onOpenBorrow,
  onOpenRepay,
  onOpenRateSwitch,
}: BorrowedPositionsListItemProps) => {
  const { currentMarket } = useProtocolDataContext()

  const {
    symbol,
    iconSymbol,
    name,
    isActive,
    isFrozen,
    isPaused,
    stableBorrowRateEnabled,
    variableBorrowAPY,
    stableBorrowAPY,
    underlyingAsset,
  } = reserve

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      borrowEnabled={reserve.borrowingEnabled}
      showBorrowCapTooltips
    >
      <ListValueRow
        title={<span>Debt</span>}
        value={totalBorrows}
        subValue={totalBorrowsUSD}
        disabled={Number(totalBorrows) === 0}
      />

      <Row caption={<span>APY</span>}>
        <IncentivesCard
          value={borrowAPY}
          incentives={incentives}
          symbol={symbol}
          variant="secondary14"
        />
      </Row>

      <Row
        caption={
          <APYTypeTooltip
            text={<span>APY type</span>}
            key="APY type"
            variant="description"
          />
        }
      >
        <ListItemAPYButton
          stableBorrowRateEnabled={stableBorrowRateEnabled}
          borrowRateMode={borrowRateMode}
          disabled={
            !stableBorrowRateEnabled || isFrozen || !isActive || isPaused
          }
          onClick={onOpenRateSwitch}
          stableBorrowAPY={stableBorrowAPY}
          variableBorrowAPY={variableBorrowAPY}
          underlyingAsset={underlyingAsset}
          currentMarket={currentMarket}
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
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="contained"
            fullWidth
            onClick={onDetbSwitchClick}
            data-cy={`swapButton`}
          >
            <span>Switch</span>
          </Button>
        ) : (
          <Button
            disabled={disableBorrow}
            variant="contained"
            onClick={onOpenBorrow}
            fullWidth
          >
            <span>Borrow</span>
          </Button>
        )}
        <Button
          disabled={disableRepay}
          variant="outlined"
          onClick={onOpenRepay}
          sx={{ ml: 1.5 }}
          fullWidth
        >
          <span>Repay</span>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  )
}
