import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { Alert, Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly warnings: ReadonlyArray<string>
  readonly healthFactor: HealthFactorResult | undefined
  readonly healthFactorRiskAccepted: boolean
  readonly setHealthFactorRiskAccepted: (accepted: boolean) => void
}

export const DcaWarnings: FC<Props> = ({
  warnings,
  healthFactor,
  healthFactorRiskAccepted,
  setHealthFactorRiskAccepted,
}) => {
  const { t } = useTranslation("common")

  if (!warnings.length && !healthFactor?.isUserConsentRequired) {
    return null
  }

  return (
    <>
      <SwapSectionSeparator />
      <Flex direction="column" my={8} gap={6}>
        {warnings.map((warning) => (
          <Alert key={warning} variant="warning" description={warning} />
        ))}
        {healthFactor?.isUserConsentRequired && (
          <HealthFactorRiskWarning
            message={t("healthFactor.warning")}
            accepted={healthFactorRiskAccepted}
            isUserConsentRequired={healthFactor.isUserConsentRequired}
            onAcceptedChange={setHealthFactorRiskAccepted}
          />
        )}
      </Flex>
    </>
  )
}
