// SUBPAGE_LAYOUT_ACTIONS_ELEMENT_ID

import { Add, Minus } from "@galacticcouncil/ui/assets/icons"
import { Button, Flex } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { createPortal } from "react-dom"
import { useTranslation } from "react-i18next"

import { SUBPAGE_LAYOUT_ACTIONS_ELEMENT_ID } from "@/modules/layout/SubpageLayout"

export const WalletsPageSubpageLayoutActions = () => {
  const { t } = useTranslation()
  const { isMobile } = useBreakpoints()

  const actionsContainer = document.getElementById(
    SUBPAGE_LAYOUT_ACTIONS_ELEMENT_ID,
  )

  if (isMobile) {
    return null
  }

  return (
    actionsContainer &&
    createPortal(
      <Flex gap={12}>
        <Button variant="accent" outline>
          {t("send")}
        </Button>
        <Button variant="emphasis" outline iconStart={Minus}>
          {t("withdraw")}
        </Button>
        <Button variant="emphasis" outline iconStart={Add}>
          {t("deposit")}
        </Button>
      </Flex>,
      actionsContainer,
    )
  )
}
