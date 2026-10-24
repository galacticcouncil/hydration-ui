import { Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export type CollateralStatus =
  | "enabled"
  | "isolated"
  | "disabled"
  | "unavailable"

const COLORS = {
  enabled: "accents.success.emphasis",
  isolated: "accents.alert.primary",
  disabled: "accents.danger.emphasis",
  unavailable: "accents.danger.emphasis",
} as const

/** Whether a supply counts as collateral, in its status colour. */
export const CollateralState: FC<{ readonly status: CollateralStatus }> = ({
  status,
}) => {
  const { t } = useTranslation("borrow")

  return (
    <Text fw={500} color={getToken(COLORS[status])}>
      {t(`collateral.${status}`)}
    </Text>
  )
}
