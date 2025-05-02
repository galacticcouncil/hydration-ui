import { Stack, Text } from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { HealthFactorLtvScale } from "@/modules/borrow/healthfactor/HealthFactorLtvScale"
import { HealthFactorRiskInfo } from "@/modules/borrow/healthfactor/HealthFactorRiskInfo"
import { HealthFactorRiskScale } from "@/modules/borrow/healthfactor/HealthFactorRiskScale"

export const HealthFactorRisk = () => {
  const { t } = useTranslation(["common", "borrow"])
  const { themeProps } = useTheme()

  const healthFactor = "1.25"
  const healthFactorColor = themeProps.accents.danger.emphasis

  const ltvColor = themeProps.accents.alert.primary
  const currentLiquidationThreshold = "0.890479108488"
  const currentLoanToValue = "0.851566582658"
  const loanToValue = "0.706077160183"

  return (
    <Stack gap={20}>
      <Text fs={14}>{t("borrow:risk.description")}</Text>
      <HealthFactorRiskInfo
        title={t("borrow:healthFactor")}
        description={t("borrow:risk.hf.description")}
        value={t("number", { value: healthFactor })}
        hint={t("borrow:risk.hf.hint")}
        scale={<HealthFactorRiskScale healthFactor={healthFactor} />}
        color={healthFactorColor}
      />
      <HealthFactorRiskInfo
        title={t("borrow:risk.ltv.title")}
        description={t("borrow:risk.ltv.description")}
        value={t("percent", { value: Number(loanToValue) * 100 })}
        hint={t("borrow:risk.ltv.hint")}
        scale={
          <HealthFactorLtvScale
            loanToValue={loanToValue}
            currentLoanToValue={currentLoanToValue}
            currentLiquidationThreshold={currentLiquidationThreshold}
            color={ltvColor}
          />
        }
        color={ltvColor}
      />
    </Stack>
  )
}
