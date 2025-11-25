import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { DcaPriceImpactWarning } from "@/modules/trade/swap/sections/DCA/DcaPriceImpactWarning"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly priceImpactLossMessage: string | undefined
  readonly priceImpactLossAccepted: boolean
  readonly healthFactor: HealthFactorResult | undefined
  readonly healthFactorRiskAccepted: boolean
  readonly onPriceImpactLossAcceptedChange: (accepted: boolean) => void
  readonly onHealthFactorRiskAcceptedChange: (accepted: boolean) => void
}

export const DcaWarnings: FC<Props> = ({
  priceImpactLossMessage,
  priceImpactLossAccepted,
  healthFactor,
  healthFactorRiskAccepted,
  onPriceImpactLossAcceptedChange,
  onHealthFactorRiskAcceptedChange,
}) => {
  const { t } = useTranslation(["common"])

  if (!priceImpactLossMessage && !healthFactor?.isUserConsentRequired) {
    return null
  }

  return (
    <>
      <SwapSectionSeparator />
      <Flex direction="column" my={8} gap={6}>
        {priceImpactLossMessage && (
          <DcaPriceImpactWarning
            message={priceImpactLossMessage}
            accepted={priceImpactLossAccepted}
            onAcceptedChange={onPriceImpactLossAcceptedChange}
          />
        )}
        {healthFactor?.isUserConsentRequired && (
          <HealthFactorRiskWarning
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
