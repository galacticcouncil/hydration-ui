import {
  ProgressCircle,
  ProgressCircleProps,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useTheme } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export type CapProgressCircleType = "supply" | "borrow"

export type CapProgressCircleProps = ProgressCircleProps & {
  tooltip: string
  type: CapProgressCircleType
}

export const CapProgressCircle: React.FC<CapProgressCircleProps> = ({
  tooltip,
  type,
  percent,
  ...props
}) => {
  const { t } = useTranslation(["common"])
  const { themeProps } = useTheme()
  const adjustedPercent = percent <= 2 ? 2 : percent > 100 ? 100 : percent
  const defaultColor =
    type === "supply"
      ? themeProps.accents.info.onPrimary
      : themeProps.colors.basePalette.coralPink

  return (
    <Tooltip text={tooltip}>
      <ProgressCircle
        {...props}
        percent={adjustedPercent}
        label={t("percent", { value: adjustedPercent })}
        color={determineColor(adjustedPercent, defaultColor)}
      />
    </Tooltip>
  )
}

const determineColor = (percent: number, defaultColor: string) => {
  if (percent >= 99.99) {
    return getToken("accents.danger.emphasis")
  } else if (percent >= 98) {
    return getToken("accents.alert.primary")
  } else {
    return defaultColor
  }
}
