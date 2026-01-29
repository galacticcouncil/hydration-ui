import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { HealthFactorResult } from "@galacticcouncil/money-market/utils"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Alert, Flex, TextButton } from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import Big from "big.js"
import { FC, ReactNode } from "react"
import { useTranslation } from "react-i18next"

import { DcaPriceImpactWarning } from "@/modules/trade/swap/sections/DCA/DcaPriceImpactWarning"
import { DcaValidationWarning } from "@/modules/trade/swap/sections/DCA/useDcaValidation"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly isFormValid: boolean
  readonly order: TradeDcaOrder | undefined | null
  readonly warnings: ReadonlyArray<DcaValidationWarning>
  readonly priceImpactLossAccepted: boolean
  readonly healthFactor: HealthFactorResult | undefined
  readonly healthFactorRiskAccepted: boolean
  readonly onPriceImpactLossAcceptedChange: (accepted: boolean) => void
  readonly onHealthFactorRiskAcceptedChange: (accepted: boolean) => void
}

export const DcaWarnings: FC<Props> = ({
  isFormValid,
  order,
  warnings,
  priceImpactLossAccepted,
  healthFactor,
  healthFactorRiskAccepted,
  onPriceImpactLossAcceptedChange,
  onHealthFactorRiskAcceptedChange,
}) => {
  const { t } = useTranslation(["common", "trade"])

  const shouldRenderHealthFactorWarning =
    !!order &&
    !!healthFactor &&
    Big(healthFactor.future).gt(1) &&
    healthFactor.isUserConsentRequired &&
    healthFactor.future < healthFactor.current

  if (!warnings.length && !shouldRenderHealthFactorWarning) {
    return null
  }

  const warningDescriptions: Record<DcaValidationWarning, string> = {
    [DcaValidationWarning.PriceImpact]: t(
      isFormValid
        ? "trade:dca.warnings.priceImpact.canContinue"
        : "trade:dca.warnings.priceImpact.cantContinue",
      {
        percentage: order?.tradeImpactPct ?? 0,
      },
    ),
    [DcaValidationWarning.Collateral]: t("trade:dca.warnings.collateral"),
  }

  const warningActions = {
    [DcaValidationWarning.Collateral]: (
      <Link to="/borrow">
        <TextButton>{t("trade:dca.warnings.collateral.cta")}</TextButton>
      </Link>
    ),
  } as const satisfies Partial<Record<DcaValidationWarning, ReactNode>>

  return (
    <>
      <SwapSectionSeparator />
      <Flex direction="column" my="base" gap="s">
        {warnings.map((warning) => {
          switch (warning) {
            case DcaValidationWarning.PriceImpact:
              return (
                <DcaPriceImpactWarning
                  key={warning}
                  canContinue={isFormValid}
                  message={warningDescriptions[warning]}
                  accepted={priceImpactLossAccepted}
                  onAcceptedChange={onPriceImpactLossAcceptedChange}
                />
              )

            default:
              return (
                <Alert
                  key={warning}
                  variant="warning"
                  description={warningDescriptions[warning]}
                  action={warningActions[warning]}
                />
              )
          }
        })}
        {order && healthFactor?.isUserConsentRequired && (
          <HealthFactorRiskWarning
            canContinue={isFormValid}
            message={t("healthFactor.warning")}
            accepted={healthFactorRiskAccepted}
            isUserConsentRequired={healthFactor.isUserConsentRequired}
            onAcceptedChange={onHealthFactorRiskAcceptedChange}
          />
        )}
      </Flex>
    </>
  )
}
