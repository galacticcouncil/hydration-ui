import {
  useFormattedHealthFactor,
  useFormattedLtv,
  useMoneyMarketData,
} from "@galacticcouncil/money-market/hooks"
import { getUserLoanToValue } from "@galacticcouncil/money-market/utils"
import { Stack, Text } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { HealthFactorLtvScale } from "@/modules/borrow/healthfactor/HealthFactorLtvScale"
import { HealthFactorRiskInfo } from "@/modules/borrow/healthfactor/HealthFactorRiskInfo"
import { HealthFactorRiskScale } from "@/modules/borrow/healthfactor/HealthFactorRiskScale"

export const HealthFactorRisk = () => {
  const { t } = useTranslation(["common", "borrow"])

  const { user } = useMoneyMarketData()

  const { healthFactor, healthFactorColor } = useFormattedHealthFactor(
    user.healthFactor,
  )

  const currentLoanToValue = user.currentLoanToValue || "0"
  const currentLiquidationThreshold = user.currentLiquidationThreshold || "0"

  const loanToValue = getUserLoanToValue(user)

  const formattedLtvValues = useFormattedLtv(
    loanToValue,
    currentLoanToValue,
    currentLiquidationThreshold,
  )

  return (
    <Stack gap={20}>
      <Text fs={14}>{t("borrow:risk.description")}</Text>
      <HealthFactorRiskInfo
        title={t("borrow:healthFactor")}
        description={t("borrow:risk.hf.description")}
        value={t("number", {
          value: healthFactor,
          maximumFractionDigits: 2,
          notation: "compact",
        })}
        hint={t("borrow:risk.hf.hint")}
        scale={<HealthFactorRiskScale healthFactor={healthFactor} />}
        color={healthFactorColor}
      />
      <HealthFactorRiskInfo
        title={t("borrow:risk.ltv.title")}
        description={t("borrow:risk.ltv.description")}
        value={t("percent", { value: formattedLtvValues.ltvPercent })}
        hint={t("borrow:risk.ltv.hint")}
        scale={
          <HealthFactorLtvScale
            loanToValue={loanToValue}
            currentLoanToValue={currentLoanToValue}
            currentLiquidationThreshold={currentLiquidationThreshold}
            {...formattedLtvValues}
          />
        }
        color={formattedLtvValues.ltvColor}
      />
    </Stack>
  )
}
