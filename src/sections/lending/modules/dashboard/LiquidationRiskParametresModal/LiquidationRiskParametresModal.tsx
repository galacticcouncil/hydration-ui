import { ModalContents } from "components/Modal/contents/ModalContents"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { Link } from "sections/lending/components/primitives/Link"
import { getHealthFactorColor, getLtvColor } from "sections/lending/utils/utils"
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
  const { t } = useTranslation()
  const healthFactorColor = getHealthFactorColor(healthFactor)

  const ltvColor = getLtvColor(
    loanToValue,
    currentLoanToValue,
    currentLiquidationThreshold,
  )

  return (
    <BasicModal open={open} setOpen={setOpen}>
      <ModalContents
        onClose={() => setOpen(false)}
        sx={{ color: "white" }}
        contents={[
          {
            title: "Liquidation risk parameters",
            content: (
              <>
                <Text fs={14} sx={{ mb: 32 }}>
                  <span>
                    Your health factor and loan to value determine the assurance
                    of your collateral. To avoid liquidations you can supply
                    more collateral or repay borrow positions.
                  </span>
                  <br />
                  <Link
                    href="https://docs.aave.com/faq/"
                    sx={{ textDecoration: "underline" }}
                    color="text.primary"
                    variant="description"
                  >
                    <span>Learn more</span>
                  </Link>
                </Text>
                <InfoWrapper
                  topTitle="Health factor"
                  topDescription="Safety of your deposited collateral against the borrowed assets and its underlying value."
                  topValue={t("value", { value: healthFactor })}
                  bottomText="If the health factor goes below 1, the liquidation of your collateral might be triggered."
                  color={healthFactorColor}
                >
                  <HFContent healthFactor={healthFactor} />
                </InfoWrapper>
                <InfoWrapper
                  topTitle="Current LTV"
                  topDescription="Your current loan to value based on your collateral supplied."
                  topValue={t("value.percentage", {
                    value: +loanToValue * 100,
                  })}
                  bottomText="If your loan to value goes above the liquidation threshold your collateral supplied may be liquidated."
                  color={ltvColor}
                >
                  <LTVContent
                    loanToValue={loanToValue}
                    currentLoanToValue={currentLoanToValue}
                    currentLiquidationThreshold={currentLiquidationThreshold}
                    color={ltvColor}
                  />
                </InfoWrapper>
              </>
            ),
          },
        ]}
      />
    </BasicModal>
  )
}
