import { HealthFactorNumber } from "sections/lending/components/HealthFactorNumber"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import ArrowRightIcon from "assets/icons/ArrowRightIcon.svg?react"

export type HealthFactorChangeProps = {
  healthFactor: string
  futureHealthFactor: string
}

export const HealthFactorChange: React.FC<HealthFactorChangeProps> = ({
  healthFactor,
  futureHealthFactor,
}) => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: "column", align: "end" }}>
      <Text fs={14} sx={{ flex: "row", gap: 8 }}>
        <HealthFactorNumber value={healthFactor} />
        <ArrowRightIcon width={16} height={16} />
        <HealthFactorNumber value={futureHealthFactor} />
      </Text>
      <Text fs={12} color="basic400">
        {t("lending.liquidationThreshold", { value: "<1.0" })}
      </Text>
    </div>
  )
}
