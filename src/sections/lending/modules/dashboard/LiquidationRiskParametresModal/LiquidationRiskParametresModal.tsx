import { AlertColor, Typography } from "@mui/material"

import { HealthFactorNumber } from "sections/lending/components/HealthFactorNumber"
import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import { HFContent } from "./components/HFContent"
import { InfoWrapper } from "./components/InfoWrapper"
import { LTVContent } from "./components/LTVContent"

interface LiquidationRiskParametresInfoModalProps {
  open: boolean
  setOpen: (value: boolean) => void
  healthFactor: string
  loanToValue: string
  currentLoanToValue: string
  currentLiquidationThreshold: string
}

export const LiquidationRiskParametresInfoModal = ({
  open,
  setOpen,
  healthFactor,
  loanToValue,
  currentLoanToValue,
  currentLiquidationThreshold,
}: LiquidationRiskParametresInfoModalProps) => {
  let healthFactorColor: AlertColor = "success"
  const hf = Number(healthFactor)
  if (hf > 1.1 && hf <= 3) {
    healthFactorColor = "warning"
  } else if (hf <= 1.1) {
    healthFactorColor = "error"
  }

  let ltvColor: AlertColor = "success"
  const ltvPercent = Number(loanToValue) * 100
  const currentLtvPercent = Number(currentLoanToValue) * 100
  const liquidationThresholdPercent = Number(currentLiquidationThreshold) * 100
  if (ltvPercent >= Math.min(currentLtvPercent, liquidationThresholdPercent)) {
    ltvColor = "error"
  } else if (
    ltvPercent > currentLtvPercent / 2 &&
    ltvPercent < currentLtvPercent
  ) {
    ltvColor = "warning"
  }

  return (
    <BasicModal open={open} setOpen={setOpen}>
      <Typography variant="h2" mb={6}>
        <span>Liquidation risk parameters</span>
      </Typography>
      <Typography mb={6}>
        <span>
          Your health factor and loan to value determine the assurance of your
          collateral. To avoid liquidations you can supply more collateral or
          repay borrow positions.
        </span>{" "}
        <Link
          href="https://docs.aave.com/faq/"
          sx={{ textDecoration: "underline" }}
          color="text.primary"
          variant="description"
        >
          <span>Learn more</span>
        </Link>
      </Typography>

      <InfoWrapper
        topTitle={<span>Health factor</span>}
        topDescription={
          <span>
            Safety of your deposited collateral against the borrowed assets and
            its underlying value.
          </span>
        }
        topValue={
          <HealthFactorNumber
            value={healthFactor}
            variant="main12"
            sx={{ color: "common.white" }}
          />
        }
        bottomText={
          <span>
            If the health factor goes below 1, the liquidation of your
            collateral might be triggered.
          </span>
        }
        color={healthFactorColor}
      >
        <HFContent healthFactor={healthFactor} />
      </InfoWrapper>

      <InfoWrapper
        topTitle={<span>Current LTV</span>}
        topDescription={
          <span>
            Your current loan to value based on your collateral supplied.
          </span>
        }
        topValue={
          <FormattedNumber
            value={loanToValue}
            percent
            variant="main12"
            color="common.white"
            symbolsColor="common.white"
          />
        }
        bottomText={
          <span>
            If your loan to value goes above the liquidation threshold your
            collateral supplied may be liquidated.
          </span>
        }
        color={ltvColor}
      >
        <LTVContent
          loanToValue={loanToValue}
          currentLoanToValue={currentLoanToValue}
          currentLiquidationThreshold={currentLiquidationThreshold}
          color={ltvColor}
        />
      </InfoWrapper>
    </BasicModal>
  )
}
