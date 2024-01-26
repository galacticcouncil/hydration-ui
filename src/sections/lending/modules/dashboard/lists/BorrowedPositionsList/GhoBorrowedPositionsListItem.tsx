import { InterestRate } from "@aave/contract-helpers"
import { InformationCircleIcon } from "@heroicons/react/outline"
import { Box, Button, SvgIcon, useMediaQuery, useTheme } from "@mui/material"
import { ContentWithTooltip } from "sections/lending/components/ContentWithTooltip"
import { GhoIncentivesCard } from "sections/lending/components/incentives/GhoIncentivesCard"
import { FixedAPYTooltipText } from "sections/lending/components/infoTooltips/FixedAPYTooltip"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { Row } from "sections/lending/components/primitives/Row"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"
import { getMaxGhoMintAmount } from "sections/lending/utils/getMaxAmountAvailableToBorrow"
import { weightedAverageAPY } from "sections/lending/utils/ghoUtilities"
import { isFeatureEnabled } from "sections/lending/utils/marketsAndNetworksConfig"

import { ListColumn } from "sections/lending/components/lists/ListColumn"
import {
  ComputedReserveData,
  ComputedUserReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListItemWrapper } from "sections/lending/modules/dashboard/lists/ListItemWrapper"
import { ListMobileItemWrapper } from "sections/lending/modules/dashboard/lists/ListMobileItemWrapper"
import { ListValueColumn } from "sections/lending/modules/dashboard/lists/ListValueColumn"
import { ListValueRow } from "sections/lending/modules/dashboard/lists/ListValueRow"

export const GhoBorrowedPositionsListItem = ({
  reserve,
  borrowRateMode,
}: ComputedUserReserveData & { borrowRateMode: InterestRate }) => {
  const { openBorrow, openRepay, openDebtSwitch } = useModalContext()
  const { currentMarket, currentMarketData } = useProtocolDataContext()
  const { ghoLoadingData, ghoReserveData, ghoUserData, user } =
    useAppDataContext()
  const [ghoUserDataFetched, ghoUserQualifiesForDiscount] = useRootStore(
    (store) => [store.ghoUserDataFetched, store.ghoUserQualifiesForDiscount],
  )
  const theme = useTheme()
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"))

  const discountableAmount =
    ghoUserData.userGhoBorrowBalance >=
    ghoReserveData.ghoMinDebtTokenBalanceForDiscount
      ? ghoUserData.userGhoAvailableToBorrowAtDiscount
      : 0
  const borrowRateAfterDiscount = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    discountableAmount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount,
  )

  const hasDiscount = ghoUserQualifiesForDiscount()

  const { isActive, isFrozen, isPaused, borrowingEnabled } = reserve
  const maxAmountUserCanMint = Number(getMaxGhoMintAmount(user, reserve))
  const availableBorrows = Math.min(
    maxAmountUserCanMint,
    ghoReserveData.aaveFacilitatorRemainingCapacity,
  )

  const props: GhoBorrowedPositionsListItemProps = {
    reserve,
    borrowRateMode,
    userGhoBorrowBalance: ghoUserData.userGhoBorrowBalance,
    hasDiscount,
    ghoLoadingData,
    ghoUserDataFetched,
    borrowRateAfterDiscount,
    currentMarket,
    userDiscountTokenBalance: ghoUserData.userDiscountTokenBalance,
    borrowDisabled:
      !isActive ||
      !borrowingEnabled ||
      isFrozen ||
      isPaused ||
      availableBorrows <= 0 ||
      ghoReserveData.aaveFacilitatorRemainingCapacity < 0.000001,
    showSwitchButton: isFeatureEnabled.debtSwitch(currentMarketData) || false,
    disableSwitch: !isActive || isPaused,
    disableRepay: !isActive || isPaused,
    onRepayClick: () =>
      openRepay(
        reserve.underlyingAsset,
        borrowRateMode,
        isFrozen,
        currentMarket,
        reserve.name,
        "dashboard",
      ),
    onBorrowClick: () =>
      openBorrow(
        reserve.underlyingAsset,
        currentMarket,
        reserve.name,
        "dashboard",
      ),
    onSwitchClick: () =>
      openDebtSwitch(reserve.underlyingAsset, borrowRateMode),
  }

  if (downToXSM) {
    return <GhoBorrowedPositionsListItemMobile {...props} />
  } else {
    return <GhoBorrowedPositionsListItemDesktop {...props} />
  }
}

interface GhoBorrowedPositionsListItemProps {
  reserve: ComputedReserveData
  borrowRateMode: InterestRate
  userGhoBorrowBalance: number
  hasDiscount: boolean
  ghoLoadingData: boolean
  ghoUserDataFetched: boolean
  borrowRateAfterDiscount: number
  currentMarket: CustomMarket
  userDiscountTokenBalance: number
  borrowDisabled: boolean
  showSwitchButton: boolean
  disableSwitch: boolean
  disableRepay: boolean
  onRepayClick: () => void
  onBorrowClick: () => void
  onSwitchClick: () => void
}

const GhoBorrowedPositionsListItemDesktop = ({
  reserve,
  borrowRateMode,
  userGhoBorrowBalance,
  hasDiscount,
  ghoLoadingData,
  ghoUserDataFetched,
  borrowRateAfterDiscount,
  currentMarket,
  userDiscountTokenBalance,
  borrowDisabled,
  onRepayClick,
  onBorrowClick,
  onSwitchClick,
  showSwitchButton,
  disableSwitch,
  disableRepay,
}: GhoBorrowedPositionsListItemProps) => {
  const { symbol, iconSymbol, name, isFrozen, underlyingAsset } = reserve

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={underlyingAsset}
      currentMarket={currentMarket}
      frozen={isFrozen}
      data-cy={`dashboardBorrowedListItem_${symbol.toUpperCase()}_${borrowRateMode}`}
      showBorrowCapTooltips
    >
      <ListValueColumn
        symbol={symbol}
        value={userGhoBorrowBalance}
        subValue={userGhoBorrowBalance}
      />
      <ListColumn>
        <GhoIncentivesCard
          withTokenIcon={hasDiscount}
          value={
            ghoLoadingData || !ghoUserDataFetched ? -1 : borrowRateAfterDiscount
          }
          data-cy={`apyType`}
          stkAaveBalance={userDiscountTokenBalance}
          ghoRoute={
            ROUTES.reserveOverview(underlyingAsset, currentMarket) +
            "/#discount"
          }
          userQualifiesForDiscount={hasDiscount}
        />
      </ListColumn>
      <ListColumn>
        <ContentWithTooltip
          tooltipContent={FixedAPYTooltipText}
          offset={[0, -4]}
          withoutHover
        >
          <Button
            variant="outlined"
            size="small"
            color="primary"
            disabled
            data-cy={`apyButton_fixed`}
          >
            GHO RATE
            <SvgIcon sx={{ marginLeft: "2px", fontSize: "14px" }}>
              <InformationCircleIcon />
            </SvgIcon>
          </Button>
        </ContentWithTooltip>
      </ListColumn>
      <ListButtonsColumn>
        {showSwitchButton ? (
          <Button
            disabled={disableSwitch}
            variant="contained"
            onClick={onSwitchClick}
            data-cy={`swapButton`}
          >
            <span>Switch</span>
          </Button>
        ) : (
          <Button
            disabled={borrowDisabled}
            variant="outlined"
            onClick={onBorrowClick}
          >
            <span>Borrow</span>
          </Button>
        )}
        <Button
          disabled={disableRepay}
          variant="outlined"
          onClick={onRepayClick}
        >
          <span>Repay</span>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  )
}

const GhoBorrowedPositionsListItemMobile = ({
  reserve,
  userGhoBorrowBalance,
  hasDiscount,
  ghoLoadingData,
  borrowRateAfterDiscount,
  currentMarket,
  userDiscountTokenBalance,
  borrowDisabled,
  onRepayClick,
  onBorrowClick,
  onSwitchClick,
  showSwitchButton,
  disableSwitch,
  disableRepay,
}: GhoBorrowedPositionsListItemProps) => {
  const { symbol, iconSymbol, name } = reserve

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={reserve.underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      showBorrowCapTooltips
    >
      <ListValueRow
        title={<span>Debt</span>}
        value={userGhoBorrowBalance}
        subValue={userGhoBorrowBalance}
        disabled={userGhoBorrowBalance === 0}
      />
      <Row
        caption={<span>APY</span>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <GhoIncentivesCard
          withTokenIcon={hasDiscount}
          value={ghoLoadingData ? -1 : borrowRateAfterDiscount}
          data-cy={`apyType`}
          stkAaveBalance={userDiscountTokenBalance}
          ghoRoute={
            ROUTES.reserveOverview(reserve.underlyingAsset, currentMarket) +
            "/#discount"
          }
          userQualifiesForDiscount={hasDiscount}
        />
      </Row>
      <Row caption={<span>APY type</span>} captionVariant="description" mb={2}>
        <ContentWithTooltip
          tooltipContent={FixedAPYTooltipText}
          offset={[0, -4]}
          withoutHover
        >
          <Button variant="outlined" size="small" color="primary">
            GHO RATE
            <SvgIcon sx={{ marginLeft: "2px", fontSize: "14px" }}>
              <InformationCircleIcon />
            </SvgIcon>
          </Button>
        </ContentWithTooltip>
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
            onClick={onSwitchClick}
          >
            <span>Switch</span>
          </Button>
        ) : (
          <Button
            disabled={borrowDisabled}
            variant="outlined"
            onClick={onBorrowClick}
            fullWidth
          >
            <span>Borrow</span>
          </Button>
        )}
        <Button
          disabled={disableRepay}
          variant="outlined"
          onClick={onRepayClick}
          sx={{ mr: 1.5 }}
          fullWidth
        >
          <span>Repay</span>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  )
}
