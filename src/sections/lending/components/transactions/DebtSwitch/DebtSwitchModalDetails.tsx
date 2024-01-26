import { valueToBigNumber } from "@aave/math-utils"
import { ArrowNarrowRightIcon } from "@heroicons/react/solid"
import { Trans } from "@lingui/macro"
import { Box, Skeleton, Stack, SvgIcon, Typography } from "@mui/material"
import React from "react"
import { GhoIncentivesCard } from "sections/lending/components/incentives/GhoIncentivesCard"
import { FixedAPYTooltip } from "sections/lending/components/infoTooltips/FixedAPYTooltip"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { Row } from "sections/lending/components/primitives/Row"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { TextWithTooltip } from "sections/lending/components/TextWithTooltip"
import { DetailsIncentivesLine } from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"
import { weightedAverageAPY } from "sections/lending/utils/ghoUtilities"

import { ComputedUserReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { GhoRange } from "./DebtSwitchModalContent"

export type DebtSwitchModalDetailsProps = {
  switchSource: ComputedUserReserveData
  switchTarget: ComputedUserReserveData
  toAmount: string
  fromAmount: string
  loading: boolean
  sourceBalance: string
  sourceBorrowAPY: string
  targetBorrowAPY: string
  showAPYTypeChange: boolean
  ghoData?: GhoRange
  currentMarket: CustomMarket
}
const ArrowRightIcon = (
  <SvgIcon color="primary" sx={{ fontSize: "14px", mx: 1 }}>
    <ArrowNarrowRightIcon />
  </SvgIcon>
)

export const DebtSwitchModalDetails = ({
  switchSource,
  switchTarget,
  toAmount,
  fromAmount,
  loading,
  sourceBalance,
  sourceBorrowAPY,
  targetBorrowAPY,
  showAPYTypeChange,
  ghoData,
  currentMarket,
}: DebtSwitchModalDetailsProps) => {
  // if there is an inputAmount + GHO -> re-calculate max
  const sourceAmountAfterSwap = valueToBigNumber(sourceBalance).minus(
    valueToBigNumber(fromAmount),
  )

  const targetAmountAfterSwap = valueToBigNumber(
    switchTarget.variableBorrows,
  ).plus(valueToBigNumber(toAmount))

  const skeleton: JSX.Element = (
    <>
      <Skeleton
        variant="rectangular"
        height={20}
        width={100}
        sx={{ borderRadius: "4px" }}
      />
      <Skeleton
        variant="rectangular"
        height={15}
        width={80}
        sx={{ borderRadius: "4px", marginTop: "4px" }}
      />
    </>
  )

  let switchToApy = 0
  let switchToRange = ghoData?.ghoApyRange
  if (switchTarget.reserve.symbol === "GHO" && ghoData) {
    switchToApy = weightedAverageAPY(
      ghoData.ghoVariableBorrowApy,
      ghoData.userCurrentBorrowBalance + ghoData.inputAmount,
      ghoData.userGhoAvailableToBorrowAtDiscount,
      ghoData.ghoBorrowAPYWithMaxDiscount,
    )
    if (switchToRange) {
      switchToRange = [switchToRange[0], switchToApy]
    }
  }

  return (
    <>
      <Row
        caption={<span>Borrow apy</span>}
        captionVariant="description"
        mb={4}
      >
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {loading ? (
            <Skeleton
              variant="rectangular"
              height={20}
              width={100}
              sx={{ borderRadius: "4px" }}
            />
          ) : (
            <>
              {switchSource.reserve.symbol === "GHO" && ghoData ? (
                <GhoIncentivesCard
                  useApyRange={false}
                  rangeValues={ghoData.ghoApyRange}
                  variant="main14"
                  color="text.secondary"
                  value={ghoData.userCurrentBorrowApy}
                  data-cy={`apyType`}
                  stkAaveBalance={ghoData.userDiscountTokenBalance}
                  ghoRoute={
                    ROUTES.reserveOverview(
                      switchSource.underlyingAsset ?? "",
                      currentMarket,
                    ) + "/#discount"
                  }
                  forceShowTooltip
                  withTokenIcon={ghoData.qualifiesForDiscount}
                  userQualifiesForDiscount={ghoData.qualifiesForDiscount}
                />
              ) : (
                <FormattedNumber
                  value={sourceBorrowAPY}
                  variant="secondary14"
                  percent
                />
              )}
              {ArrowRightIcon}
              {switchTarget.reserve.symbol === "GHO" && ghoData ? (
                <GhoIncentivesCard
                  useApyRange={
                    ghoData.qualifiesForDiscount && !ghoData.inputAmount
                  }
                  rangeValues={
                    ghoData.inputAmount === 0
                      ? ghoData.ghoApyRange
                      : switchToRange
                  }
                  variant="main14"
                  color="text.secondary"
                  value={
                    ghoData.inputAmount === 0
                      ? ghoData.userBorrowApyAfterMaxSwitch
                      : switchToApy
                  }
                  data-cy={`apyType`}
                  stkAaveBalance={ghoData.userDiscountTokenBalance}
                  ghoRoute={
                    ROUTES.reserveOverview(
                      switchTarget.underlyingAsset ?? "",
                      currentMarket,
                    ) + "/#discount"
                  }
                  forceShowTooltip
                  withTokenIcon={ghoData.qualifiesForDiscount}
                  userQualifiesForDiscount={ghoData.qualifiesForDiscount}
                />
              ) : (
                <FormattedNumber
                  value={targetBorrowAPY}
                  variant="secondary14"
                  percent
                />
              )}
            </>
          )}
        </Box>
      </Row>
      {showAPYTypeChange && (
        <Row
          caption={
            <Stack direction="row">
              <span>APY type</span>
              <TextWithTooltip>
                <span>
                  You can only switch to tokens with variable APY types. After
                  this transaction, you may change the variable rate to a stable
                  one if available.
                </span>
              </TextWithTooltip>
            </Stack>
          }
          captionVariant="description"
          mb={4}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            {loading ? (
              <Skeleton
                variant="rectangular"
                height={20}
                width={100}
                sx={{ borderRadius: "4px" }}
              />
            ) : (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                {switchSource.reserve.symbol === "GHO" ? (
                  <FixedAPYTooltip
                    text={<span>Fixed</span>}
                    typography="secondary14"
                  />
                ) : (
                  <Typography variant="secondary14">
                    <span>Stable</span>
                  </Typography>
                )}
                <SvgIcon color="primary" sx={{ fontSize: "14px", mx: 1 }}>
                  <ArrowNarrowRightIcon />
                </SvgIcon>
                {switchTarget.reserve.symbol === "GHO" ? (
                  <FixedAPYTooltip
                    text={<span>Fixed</span>}
                    typography="secondary14"
                  />
                ) : (
                  <Typography variant="secondary14">
                    <span>Variable</span>
                  </Typography>
                )}
              </Box>
            )}
          </Box>
        </Row>
      )}
      <DetailsIncentivesLine
        incentives={switchSource.reserve.aIncentivesData}
        symbol={switchSource.reserve.symbol}
        futureIncentives={switchSource.reserve.aIncentivesData}
        futureSymbol={switchSource.reserve.symbol}
        loading={loading}
      />

      <Row
        caption={<span>Borrow balance after switch</span>}
        captionVariant="description"
        mb={4}
        align="flex-start"
      >
        <Box sx={{ textAlign: "right" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            {loading ? (
              skeleton
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TokenIcon
                    symbol={switchSource.reserve.iconSymbol}
                    sx={{ mr: 2, ml: 4, fontSize: "16px" }}
                  />
                  <FormattedNumber
                    value={sourceAmountAfterSwap.toString()}
                    variant="secondary14"
                    compact
                  />
                </Box>
                <FormattedNumber
                  value={sourceAmountAfterSwap
                    .multipliedBy(
                      valueToBigNumber(switchSource.reserve.priceInUSD),
                    )
                    .toString()}
                  variant="helperText"
                  compact
                  symbol="USD"
                  symbolsColor="text.secondary"
                  color="text.secondary"
                />
              </>
            )}
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            mt={2}
          >
            {loading ? (
              skeleton
            ) : (
              <>
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <TokenIcon
                    symbol={switchTarget.reserve.iconSymbol}
                    sx={{ mr: 2, ml: 4, fontSize: "16px" }}
                  />
                  <FormattedNumber
                    value={targetAmountAfterSwap.toString()}
                    variant="secondary14"
                    compact
                  />
                </Box>
                <FormattedNumber
                  value={targetAmountAfterSwap
                    .multipliedBy(
                      valueToBigNumber(switchTarget.reserve.priceInUSD),
                    )
                    .toString()}
                  variant="helperText"
                  compact
                  symbol="USD"
                  symbolsColor="text.secondary"
                  color="text.secondary"
                />
              </>
            )}
          </Box>
        </Box>
      </Row>
    </>
  )
}
