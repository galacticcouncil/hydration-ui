import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { Alert, Flex } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { DcaPriceImpactWarning } from "@/modules/trade/swap/sections/DCA/DcaPriceImpactWarning"
import { DcaValidationWarning } from "@/modules/trade/swap/sections/DCA/useDcaPriceImpactValidation"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly isFormValid: boolean
  readonly order: TradeDcaOrder | undefined
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
    healthFactor.isUserConsentRequired

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
  }

  return (
    <>
      <SwapSectionSeparator />
      <Flex direction="column" my={8} gap={6}>
        {warnings.map((warning) =>
          warning === DcaValidationWarning.PriceImpact ? (
            <DcaPriceImpactWarning
              key={warning}
              canContinue={isFormValid}
              message={warningDescriptions[warning]}
              accepted={priceImpactLossAccepted}
              onAcceptedChange={onPriceImpactLossAcceptedChange}
            />
          ) : (
            <Alert
              key={warning}
              variant="warning"
              description={warningDescriptions[warning]}
            />
          ),
        )}
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
