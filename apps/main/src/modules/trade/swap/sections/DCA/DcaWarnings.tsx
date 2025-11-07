import { HealthFactorRiskWarning } from "@galacticcouncil/money-market/components"
import { Flex } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { SwapSectionSeparator } from "@/modules/trade/swap/SwapPage.styled"

type Props = {
  readonly healthFactor: HealthFactorResult | undefined
  readonly healthFactorRiskAccepted: boolean
  readonly setHealthFactorRiskAccepted: (accepted: boolean) => void
}

export const DcaWarnings: FC<Props> = ({
  healthFactor,
  healthFactorRiskAccepted,
  setHealthFactorRiskAccepted,
}) => {
  const { t } = useTranslation("common")

  if (!healthFactor?.isUserConsentRequired) {
    return null
  }

  return (
    <>
      <SwapSectionSeparator />
      <Flex direction="column" mt={10}>
        <HealthFactorRiskWarning
          message={t("healthFactor.warning")}
          accepted={healthFactorRiskAccepted}
          isUserConsentRequired={healthFactor.isUserConsentRequired}
          onAcceptedChange={setHealthFactorRiskAccepted}
        />
      </Flex>
    </>
  )
}
