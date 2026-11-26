import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { Initial, Pill, Rest } from "./StablepoolBadge.styled"

export const StablepoolBadge = () => {
  const { t } = useTranslation("common")
  const { isMobile } = useBreakpoints()
  const label = t("stablepool")

  return (
    <Pill disableAnimation={isMobile}>
      <Initial>{label.slice(0, 1)}</Initial>
      <Rest>
        <span>{label.slice(1)}</span>
      </Rest>
    </Pill>
  )
}
