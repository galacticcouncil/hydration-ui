import { HealthFactorNumber } from "sections/lending/components/HealthFactorNumber"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import ArrowRightIcon from "assets/icons/ArrowRightIcon.svg?react"
import { Icon } from "components/Icon/Icon"

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
      <div sx={{ flex: "row", gap: 8, color: "white" }}>
        <HealthFactorNumber fontSize={14} value={healthFactor} />
        {futureHealthFactor !== "-1" && (
          <>
            <Icon size={14} icon={<ArrowRightIcon />} />
            <HealthFactorNumber fontSize={14} value={futureHealthFactor} />
          </>
        )}
      </div>
      <Text fs={12} color="basic400">
        {t("lending.liquidationThreshold", { value: "<1.0" })}
      </Text>
    </div>
  )
}
