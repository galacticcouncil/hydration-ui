import { Stack, Text } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HealthFactorLtvScale } from "@/modules/money-market/HealthFactorLtvScale"
import { HealthFactorRiskInfo } from "@/modules/money-market/HealthFactorRiskInfo"
import { HealthFactorRiskScale } from "@/modules/money-market/HealthFactorRiskScale"
import { useFormattedHealthFactor } from "@/modules/money-market/useFormattedHealthFactor"
import { useFormattedLtv } from "@/modules/money-market/useFormattedLtv"

type HealthFactorRiskProps = {
  readonly healthFactor: string
  readonly loanToValue: string
  readonly currentLoanToValue: string
  readonly currentLiquidationThreshold: string
}

export const HealthFactorRisk: FC<HealthFactorRiskProps> = ({
  healthFactor: healthFactorValue,
  loanToValue,
  currentLoanToValue,
  currentLiquidationThreshold,
}) => {
  const { t } = useTranslation(["common", "borrow"])

  const { healthFactor, healthFactorColor } =
    useFormattedHealthFactor(healthFactorValue)

  const formattedLtvValues = useFormattedLtv(
    loanToValue,
    currentLoanToValue,
    currentLiquidationThreshold,
  )

  return (
    <Stack gap="xl">
      <Text fs="p3">{t("borrow:risk.description")}</Text>
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
