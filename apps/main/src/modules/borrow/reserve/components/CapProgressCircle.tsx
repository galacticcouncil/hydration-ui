import {
  ProgressCircle,
  ProgressCircleProps,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export type CapProgressCircleProps = ProgressCircleProps & {
  tooltip: string
}

export const CapProgressCircle: React.FC<CapProgressCircleProps> = ({
  tooltip,
  percent,
  ...props
}) => {
  const { t } = useTranslation(["common"])
  const adjustedPercent = percent <= 2 ? 2 : percent > 100 ? 100 : percent

  return (
    <Tooltip text={tooltip}>
      <ProgressCircle
        {...props}
        percent={adjustedPercent}
        label={t("percent", { value: adjustedPercent })}
        color={determineColor(adjustedPercent)}
      />
    </Tooltip>
  )
}

const determineColor = (percent: number) => {
  if (percent >= 99.99) {
    return getToken("accents.danger.emphasis")
  } else if (percent >= 98) {
    return getToken("accents.alert.primary")
  } else {
    return getToken("accents.success.emphasis")
  }
}
