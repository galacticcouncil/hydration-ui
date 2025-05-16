import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useTranslation } from "react-i18next"

import { Label } from "./StablepoolBadge.styled"
import { Pill } from "./StablepoolBadge.styled"

export const StablepoolBadge = () => {
  const { t } = useTranslation("common")
  const { isMobile } = useBreakpoints()

  return (
    <Pill disableAnimation={isMobile}>
      <Label>{t("stablepool")}</Label>
    </Pill>
  )
}
