import { QuestionCircleRegular } from "@galacticcouncil/ui/assets/icons"
import {
  ExternalLink,
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MenuSelectionItemArrow,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { HYDRATION_DOCS_LINK } from "@/config/links"

export const DocsLink: FC = () => {
  const { t } = useTranslation()

  return (
    <ExternalLink href={HYDRATION_DOCS_LINK} underlined={false}>
      <MenuSelectionItem as="span">
        <MenuItemIcon component={QuestionCircleRegular} />
        <MenuItemLabel>{t("docs")}</MenuItemLabel>
        <MenuItemDescription>{t("docs.description")}</MenuItemDescription>
        <MenuSelectionItemArrow />
      </MenuSelectionItem>
    </ExternalLink>
  )
}
