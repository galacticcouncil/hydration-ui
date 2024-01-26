import {
  Box,
  Button,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { CapType } from "sections/lending/components/caps/helper"
import { GhoIncentivesCard } from "sections/lending/components/incentives/GhoIncentivesCard"
import { AvailableTooltip } from "sections/lending/components/infoTooltips/AvailableTooltip"
import { FixedAPYTooltip } from "sections/lending/components/infoTooltips/FixedAPYTooltip"
import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListItem } from "sections/lending/components/lists/ListItem"
import { Row } from "sections/lending/components/primitives/Row"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"
import { DASHBOARD_LIST_COLUMN_WIDTHS } from "sections/lending/utils/dashboardSortUtils"
import { getMaxGhoMintAmount } from "sections/lending/utils/getMaxAmountAvailableToBorrow"
import { weightedAverageAPY } from "sections/lending/utils/ghoUtilities"

import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListMobileItemWrapper } from "sections/lending/modules/dashboard/lists/ListMobileItemWrapper"
import { ListValueColumn } from "sections/lending/modules/dashboard/lists/ListValueColumn"
import { ListValueRow } from "sections/lending/modules/dashboard/lists/ListValueRow"
import { GhoBorrowAssetsItem } from "./types"

export const GhoBorrowAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  underlyingAsset,
  isFreezed,
  reserve,
}: GhoBorrowAssetsItem) => {
  const { openBorrow } = useModalContext()
  const { user } = useAppDataContext()
  const { currentMarket } = useProtocolDataContext()
  const { ghoReserveData, ghoUserData, ghoLoadingData } = useAppDataContext()
  const { ghoUserDataFetched } = useRootStore()
  const theme = useTheme()
  const downToXSM = useMediaQuery(theme.breakpoints.down("xsm"))

  const maxAmountUserCanMint = Number(getMaxGhoMintAmount(user, reserve))
  const availableBorrows = Math.min(
    maxAmountUserCanMint,
    ghoReserveData.aaveFacilitatorRemainingCapacity,
  )
  const borrowButtonDisable = isFreezed || availableBorrows <= 0
  const debtBalanceAfterMaxBorrow =
    availableBorrows + ghoUserData.userGhoBorrowBalance

  // Determine borrow APY range
  const userCurrentBorrowApy = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    ghoUserData.userGhoBorrowBalance,
    ghoUserData.userGhoAvailableToBorrowAtDiscount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount,
  )
  const userBorrowApyAfterNewBorrow = weightedAverageAPY(
    ghoReserveData.ghoVariableBorrowAPY,
    debtBalanceAfterMaxBorrow,
    ghoUserData.userGhoAvailableToBorrowAtDiscount,
    ghoReserveData.ghoBorrowAPYWithMaxDiscount,
  )
  const ghoApyRange: [number, number] | undefined = ghoUserDataFetched
    ? [
        ghoUserData.userGhoAvailableToBorrowAtDiscount === 0
          ? ghoReserveData.ghoBorrowAPYWithMaxDiscount
          : userCurrentBorrowApy,
        userBorrowApyAfterNewBorrow,
      ]
    : undefined

  const props: GhoBorrowAssetsListItemProps = {
    symbol,
    iconSymbol,
    name,
    underlyingAsset,
    currentMarket,
    availableBorrows,
    borrowButtonDisable,
    userDiscountTokenBalance: ghoUserData.userDiscountTokenBalance,
    ghoApyRange,
    ghoUserDataFetched,
    userBorrowApyAfterNewBorrow,
    ghoLoadingData,
    onBorrowClick: () =>
      openBorrow(underlyingAsset, currentMarket, name, "dashboard"),
  }
  if (downToXSM) {
    return <GhoBorrowAssetsListItemMobile {...props} />
  } else {
    return <GhoBorrowAssetsListItemDesktop {...props} />
  }
}

interface GhoBorrowAssetsListItemProps {
  symbol: string
  iconSymbol: string
  name: string
  underlyingAsset: string
  currentMarket: CustomMarket
  availableBorrows: number
  borrowButtonDisable: boolean
  userDiscountTokenBalance: number
  ghoApyRange: [number, number] | undefined
  ghoUserDataFetched: boolean
  userBorrowApyAfterNewBorrow: number
  ghoLoadingData: boolean
  onBorrowClick: () => void
}

const GhoBorrowAssetsListItemDesktop = ({
  symbol,
  iconSymbol,
  name,
  underlyingAsset,
  currentMarket,
  availableBorrows,
  borrowButtonDisable,
  userDiscountTokenBalance,
  ghoApyRange,
  ghoUserDataFetched,
  userBorrowApyAfterNewBorrow,
  onBorrowClick,
}: GhoBorrowAssetsListItemProps) => {
  return (
    <ListItem
      sx={{
        borderTop: "1px solid",
        borderBottom: "1px solid",
        borderColor: "divider",
        mb: 2,
      }}
      data-cy={`dashboardBorrowListItem_${symbol.toUpperCase()}`}
    >
      <ListColumn maxWidth={DASHBOARD_LIST_COLUMN_WIDTHS.CELL} isRow>
        <Link
          href={ROUTES.reserveOverview(underlyingAsset, currentMarket)}
          noWrap
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          <TokenIcon symbol={iconSymbol} fontSize="large" />
          <Tooltip title={`${name} (${symbol})`} arrow placement="top">
            <Typography
              variant="subheader1"
              sx={{ ml: 3 }}
              noWrap
              data-cy={`assetName`}
            >
              {symbol}
            </Typography>
          </Tooltip>
        </Link>
      </ListColumn>
      <ListColumn>
        <Box display="flex" flexDirection="column">
          <AvailableTooltip
            capType={CapType.borrowCap}
            text={<span>Available</span>}
            variant="subheader2"
            color="text.secondary"
            ml={-1}
          />
          <ListValueColumn
            listColumnProps={{
              p: 0,
            }}
            symbol={symbol}
            value={availableBorrows}
            subValue={availableBorrows}
            disabled={availableBorrows === 0}
            withTooltip
          />
        </Box>
      </ListColumn>
      <ListColumn>
        <FixedAPYTooltip
          text={<span>APY, borrow rate</span>}
          variant="subheader2"
          color="text.secondary"
        />
        <GhoIncentivesCard
          withTokenIcon={true}
          useApyRange
          rangeValues={ghoApyRange}
          value={ghoUserDataFetched ? userBorrowApyAfterNewBorrow : -1}
          data-cy={`apyType`}
          stkAaveBalance={userDiscountTokenBalance}
          ghoRoute={
            ROUTES.reserveOverview(underlyingAsset, currentMarket) +
            "/#discount"
          }
          forceShowTooltip
          userQualifiesForDiscount
        />
      </ListColumn>
      <ListButtonsColumn>
        <Button
          disabled={borrowButtonDisable}
          variant="contained"
          onClick={onBorrowClick}
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
    </ListItem>
  )
}

const GhoBorrowAssetsListItemMobile = ({
  symbol,
  iconSymbol,
  name,
  underlyingAsset,
  currentMarket,
  availableBorrows,
  borrowButtonDisable,
  userDiscountTokenBalance,
  ghoApyRange,
  ghoLoadingData,
  userBorrowApyAfterNewBorrow,
  onBorrowClick,
}: GhoBorrowAssetsListItemProps) => {
  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
    >
      <ListValueRow
        title={<span>Available to borrow</span>}
        value={availableBorrows}
        subValue={availableBorrows}
        disabled={availableBorrows === 0}
      />

      <Row
        caption={
          <FixedAPYTooltip
            text={<span>APY, borrow rate</span>}
            key="APY_dash_mob_variable_ type"
            variant="description"
          />
        }
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <GhoIncentivesCard
          withTokenIcon={true}
          useApyRange
          rangeValues={ghoApyRange}
          value={ghoLoadingData ? -1 : userBorrowApyAfterNewBorrow}
          data-cy="apyType"
          stkAaveBalance={userDiscountTokenBalance}
          ghoRoute={
            ROUTES.reserveOverview(underlyingAsset, currentMarket) +
            "/#discount"
          }
          forceShowTooltip
          userQualifiesForDiscount
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
          disabled={borrowButtonDisable}
          variant="contained"
          onClick={onBorrowClick}
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
