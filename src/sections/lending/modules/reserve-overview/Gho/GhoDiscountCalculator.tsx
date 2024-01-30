import { FormattedGhoReserveData } from "@aave/math-utils"
import AddIcon from "@mui/icons-material/Add"
import InfoIcon from "@mui/icons-material/InfoOutlined"
import {
  Alert,
  Box,
  Skeleton,
  SvgIcon,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { Stack } from "@mui/system"
import { ReactNode, useEffect, useState } from "react"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { ReserveOverviewBox } from "sections/lending/components/ReserveOverviewBox"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

import { ESupportedTimeRanges } from "sections/lending/modules/reserve-overview/TimeRangeSelector"
import { CalculatorInput } from "./CalculatorInput"
import { GhoPieChartContainer } from "./GhoPieChartContainer"
import {
  calculateDiscountRate,
  getSecondsForGhoBorrowTermDuration,
} from "./utils"

interface CalculatedRateSelection {
  baseRate: number
  rateAfterDiscount: number
  rateAfterMaxDiscount: number
}

let initialRateValuesSet = false

// We start this calculator off showing values to reach max discount
export const GhoDiscountCalculator = () => {
  const { ghoLoadingData, ghoReserveData } = useAppDataContext()
  const { breakpoints, palette } = useTheme()
  const downToXsm = useMediaQuery(breakpoints.down("xsm"))

  const [stkAave, setStkAave] = useState<number | null>(100)
  const [ghoBorrow, setGhoBorrow] = useState<number | null>(10000)

  const [rateSelection, setRateSelection] = useState<CalculatedRateSelection>({
    baseRate: ghoReserveData.ghoVariableBorrowAPY,
    rateAfterDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount, // Initialize with max discount
    rateAfterMaxDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount,
  })
  const [discountableGhoAmount, setDiscountableGhoAmount] = useState<number>(0)

  useEffect(() => {
    // Inital values come from the store, but if that data is not loaded yet, update it once it is
    if (!ghoLoadingData && !initialRateValuesSet) {
      setRateSelection({
        baseRate: ghoReserveData.ghoVariableBorrowAPY,
        rateAfterDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount,
        rateAfterMaxDiscount: ghoReserveData.ghoBorrowAPYWithMaxDiscount,
      })
      initialRateValuesSet = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ghoLoadingData])

  /* eslint-disable react-hooks/exhaustive-deps */
  useEffect(() => {
    const stkAaveAmount = stkAave ?? 0
    const ghoBorrowAmount = ghoBorrow ?? 0
    let discountableAmount = Math.round(
      stkAaveAmount * ghoReserveData.ghoDiscountedPerToken,
    )
    if (stkAaveAmount < ghoReserveData.ghoMinDiscountTokenBalanceForDiscount) {
      discountableAmount = 0
    }
    const termDuration = getSecondsForGhoBorrowTermDuration(
      ESupportedTimeRanges.OneYear,
    )
    const calculatedRate = calculateDiscountRate(
      ghoBorrowAmount,
      termDuration,
      discountableAmount,
      ghoReserveData.ghoBaseVariableBorrowRate,
      ghoReserveData.ghoDiscountRate,
    )

    setDiscountableGhoAmount(discountableAmount)
    setRateSelection({
      baseRate: calculatedRate.baseRate,
      rateAfterDiscount: calculatedRate.rateAfterDiscount,
      rateAfterMaxDiscount: calculatedRate.rateAfterMaxDiscount,
    })
  }, [stkAave, ghoBorrow])

  const StakingDiscountAlert = () => {
    const maxGhoNotBorrowed = ghoBorrow && ghoBorrow < discountableGhoAmount
    const maxDiscountNotReached = ghoBorrow && discountableGhoAmount < ghoBorrow
    const additionalStkAaveToReachMax = !maxDiscountNotReached
      ? 0
      : (ghoBorrow - discountableGhoAmount) /
        Number(ghoReserveData.ghoDiscountedPerToken)

    const handleAddStkAaveForMaxDiscount = () => {
      if (stkAave) {
        setStkAave(stkAave + additionalStkAaveToReachMax)
      } else {
        // reset to default
        setGhoBorrow(10000)
        setStkAave(100)
      }
    }

    let alertText = null

    if (maxGhoNotBorrowed) {
      alertText = (
        <Typography variant="caption" component="p" color="text.secondary">
          <span>
            You may borrow up to{" "}
            <FormattedNumber
              value={discountableGhoAmount}
              variant="caption"
              color="text.secondary"
              visibleDecimals={2}
            />{" "}
            GHO at{" "}
            <FormattedNumber
              value={rateSelection.rateAfterMaxDiscount}
              percent
              variant="caption"
              symbolsColor="text.secondary"
              sx={{ ".MuiTypography-root": { ml: 0 } }}
            />{" "}
            (max discount)
          </span>
        </Typography>
      )
    }

    if (!stkAave)
      alertText = (
        <Typography variant="caption" component="p" color="warning.dark">
          <span>Add stkAAVE to see borrow APY with the discount</span>
        </Typography>
      )

    if (maxDiscountNotReached) {
      if (discountableGhoAmount === 0) {
        alertText = (
          <Typography variant="caption" component="p" color="text.secondary">
            <span>
              <Typography
                component="span"
                variant="subheader2"
                color="text.highlight"
                onClick={handleAddStkAaveForMaxDiscount}
                sx={{
                  "&:hover": {
                    textDecoration: "underline",
                    cursor: "pointer",
                    ".MuiTypography-root": {
                      textDecoration: "underline",
                    },
                  },
                }}
              >
                <SvgIcon
                  sx={{
                    fontSize: "14px",
                    verticalAlign: "middle",
                    marginBottom: "3px",
                  }}
                >
                  <AddIcon />
                </SvgIcon>
                <span>Add stkAAVE</span>
              </Typography>{" "}
              <span>to see borrow rate with discount</span>
            </span>
          </Typography>
        )
      } else {
        alertText = (
          <Typography variant="caption" component="p" color="text.secondary">
            <span>
              <Typography
                component="span"
                variant="subheader2"
                color="text.highlight"
                onClick={handleAddStkAaveForMaxDiscount}
                sx={{
                  "&:hover": {
                    textDecoration: "underline",
                    cursor: "pointer",
                    ".MuiTypography-root": {
                      textDecoration: "underline",
                    },
                  },
                }}
              >
                <SvgIcon
                  sx={{
                    fontSize: "14px",
                    verticalAlign: "middle",
                    marginBottom: "3px",
                  }}
                >
                  <AddIcon />
                </SvgIcon>
                <span>
                  Add{" "}
                  <FormattedNumber
                    value={additionalStkAaveToReachMax}
                    variant="subheader2"
                    visibleDecimals={2}
                    sx={{
                      ".MuiTypography-root": { ml: 0 },
                    }}
                  />{" "}
                </span>
                stkAAVE
              </Typography>{" "}
              <span>
                to borrow at{" "}
                <FormattedNumber
                  value={rateSelection.rateAfterMaxDiscount}
                  percent
                  variant="caption"
                  symbolsColor="text.secondary"
                  sx={{ ".MuiTypography-root": { ml: 0 } }}
                />{" "}
                (max discount)
              </span>
            </span>
          </Typography>
        )
      }
    }

    return (
      <Alert
        icon={
          <InfoIcon sx={{ color: (theme) => theme.palette.primary.main }} />
        }
        severity="info"
        sx={{
          background: palette.background.surface2,
          visibility: alertText ? "visible" : "hidden",
        }}
      >
        {alertText}
      </Alert>
    )
  }

  const GhoDiscountCalculatorDesktop = (
    <Stack direction="row" gap={8}>
      <Box sx={{ flexBasis: "50%" }}>
        <GhoPieChartContainer
          borrowAmount={ghoBorrow}
          discountableAmount={discountableGhoAmount}
          baseRate={rateSelection.baseRate}
          discountedAmountRate={rateSelection.rateAfterMaxDiscount}
          rateAfterDiscount={rateSelection.rateAfterDiscount}
        />
      </Box>
      <Stack
        direction="column"
        alignItems="center"
        gap={2}
        sx={{ flexBasis: "50%" }}
      >
        <Box sx={{ width: "100%", mt: 16 }}>
          <CalculatorInput
            title="Borrow amount"
            value={ghoBorrow}
            disabled={ghoLoadingData}
            tokenSymbol="GHO"
            onValueChanged={(value) => setGhoBorrow(value)}
            sliderMax={100000}
            sliderMin={1}
            downToXsm={downToXsm}
          />
        </Box>
        <Box sx={{ width: "100%" }}>
          <CalculatorInput
            title="Staked AAVE amount"
            value={stkAave}
            disabled={ghoLoadingData}
            tokenSymbol="stkAAVE"
            onValueChanged={(value) => setStkAave(value)}
            sliderMax={1000}
            downToXsm={downToXsm}
          />
        </Box>
        <Box sx={{ width: "100%" }}>
          <StakingDiscountAlert />
        </Box>
      </Stack>
    </Stack>
  )

  const GhoDiscountCalculatorMobile = (
    <>
      <GhoPieChartContainer
        borrowAmount={ghoBorrow}
        discountableAmount={discountableGhoAmount}
        baseRate={rateSelection.baseRate}
        discountedAmountRate={rateSelection.rateAfterMaxDiscount}
        rateAfterDiscount={rateSelection.rateAfterDiscount}
      />
      <Stack gap={2} sx={{ minHeight: "280px" }}>
        <Box sx={{ width: "100%" }}>
          <CalculatorInput
            title="Borrow amount"
            value={ghoBorrow}
            disabled={ghoLoadingData}
            tokenSymbol="GHO"
            onValueChanged={(value) => setGhoBorrow(value)}
            sliderMax={100000}
            sliderMin={1}
            downToXsm={downToXsm}
          />
        </Box>
        <Box sx={{ width: "100%" }}>
          <CalculatorInput
            title="Staked AAVE amount"
            value={stkAave}
            disabled={ghoLoadingData}
            tokenSymbol="stkAAVE"
            onValueChanged={(value) => setStkAave(value)}
            sliderMax={1000}
            downToXsm={downToXsm}
          />
        </Box>
        <StakingDiscountAlert />
      </Stack>
    </>
  )

  return (
    <>
      <Typography variant="subheader1" gutterBottom>
        <span>Staking discount</span>
      </Typography>
      <Typography variant="caption" color="text.secondary" mb={6}>
        <span>
          Users who stake AAVE in Safety Module (i.e. stkAAVE holders) receive a
          discount on GHO borrow interest rate. The discount applies to 100 GHO
          for every 1 stkAAVE held. Use the calculator below to see GHO borrow
          rate with the discount applied.
        </span>
      </Typography>
      {downToXsm ? GhoDiscountCalculatorMobile : GhoDiscountCalculatorDesktop}
      <Box sx={{ mt: downToXsm ? 4 : 10 }}>
        <GhoDiscountParametersComponent
          loading={ghoLoadingData}
          downToXsm={downToXsm}
          ghoReserveData={ghoReserveData}
        />
      </Box>
    </>
  )
}

const GhoDiscountParametersComponent: React.FC<{
  loading: boolean
  downToXsm: boolean
  ghoReserveData: FormattedGhoReserveData
}> = ({ loading, downToXsm, ghoReserveData }) => {
  return (
    <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: "100%", width: "100%" }}>
      <Box sx={{ display: "inline-flex", alignItems: "center" }}>
        <Typography variant="subheader1">
          <span>Discount model parameters</span>
        </Typography>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          pt: "12px",
          columnGap: 2.5,
        }}
      >
        <DiscountModelParameter
          title={<span>Discountable amount</span>}
          fullWidth={downToXsm}
          loading={loading}
        >
          <Typography variant="secondary14" display="flex" alignItems="center">
            <TokenIcon symbol="GHO" sx={{ fontSize: "14px", mr: 16 }} />
            {ghoReserveData.ghoDiscountedPerToken}
            <Typography
              component="span"
              variant="secondary14"
              color="text.primary"
              sx={{ mx: 1 }}
            >
              <span>to</span>
            </Typography>{" "}
            <TokenIcon symbol="stkAAVE" sx={{ fontSize: "14px", mr: 16 }} />1
          </Typography>
        </DiscountModelParameter>
        <DiscountModelParameter
          title={<span>Discount</span>}
          fullWidth={downToXsm}
          loading={loading}
        >
          <FormattedNumber
            value={ghoReserveData.ghoDiscountRate}
            percent
            variant="secondary14"
            color="text.primary"
            sx={{ mr: 1 }}
            visibleDecimals={0}
          />
        </DiscountModelParameter>
        <DiscountModelParameter
          title={<span>APY with discount applied</span>}
          fullWidth={downToXsm}
          loading={loading}
        >
          <FormattedNumber
            value={ghoReserveData.ghoBorrowAPYWithMaxDiscount}
            percent
            variant="secondary14"
            color="text.primary"
          />
        </DiscountModelParameter>
        <DiscountModelParameter
          title={<span>Minimum staked Aave amount</span>}
          fullWidth={downToXsm}
          loading={loading}
        >
          <Stack direction="row" alignItems="center">
            <TokenIcon symbol="stkAAVE" sx={{ fontSize: "14px", mr: 16 }} />
            <FormattedNumber
              value={ghoReserveData.ghoMinDiscountTokenBalanceForDiscount}
              visibleDecimals={3}
              variant="secondary14"
              color="text.primary"
            />
          </Stack>
        </DiscountModelParameter>
        <DiscountModelParameter
          title={<span>Minimum GHO borrow amount</span>}
          fullWidth={downToXsm}
          loading={loading}
        >
          <Stack direction="row" alignItems="center">
            <TokenIcon symbol="GHO" sx={{ fontSize: "14px", mr: 16 }} />
            <FormattedNumber
              value={ghoReserveData.ghoMinDebtTokenBalanceForDiscount}
              visibleDecimals={2}
              variant="secondary14"
              color="text.primary"
            />
          </Stack>
        </DiscountModelParameter>
      </Box>
      <Typography variant="caption" color="text.secondary">
        <span>
          Discount parameters are decided by the Aave community and may be
          changed over time. Check Governance for updates and vote to
          participate.{" "}
          <Link
            href="https://governance.aave.com"
            sx={{ textDecoration: "underline" }}
            variant="caption"
            color="text.secondary"
          >
            Learn more
          </Link>
        </span>
      </Typography>
    </Box>
  )
}

interface DiscountModelParameterProps {
  title: ReactNode
  children: ReactNode
  fullWidth: boolean
  loading: boolean
}

const DiscountModelParameter = ({
  title,
  children,
  fullWidth,
  loading,
}: DiscountModelParameterProps) => {
  return (
    <ReserveOverviewBox
      fullWidth={fullWidth}
      title={<Typography variant="description">{title}</Typography>}
    >
      {loading ? <Skeleton variant="text" width={75} /> : children}
    </ReserveOverviewBox>
  )
}
