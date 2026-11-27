import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorResult } from "@/api/aave"
import { HealthFactorRiskWarning } from "@/modules/money-market/health-factor/HealthFactorRiskWarning"

type Props = {
  readonly isFormValid: boolean
  readonly healthFactor: HealthFactorResult | undefined
  readonly healthFactorRiskAccepted: boolean
  readonly setHealthFactorRiskAccepted: (accepted: boolean) => void
}

export const TradeWarnings: FC<Props> = ({
  isFormValid,
  healthFactor,
  healthFactorRiskAccepted,
  setHealthFactorRiskAccepted,
}) => {
  const { t } = useTranslation(["common", "trade"])

  if (!healthFactor) {
    return null
  }

  return (
    <HealthFactorRiskWarning
      canContinue={isFormValid}
      message={t("healthFactor.warning")}
      accepted={healthFactorRiskAccepted}
      isUserConsentRequired={healthFactor.isUserConsentRequired}
      onAcceptedChange={setHealthFactorRiskAccepted}
    />
  )
}
