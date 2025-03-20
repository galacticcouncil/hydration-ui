import { Rectangle7101 } from "@galacticcouncil/ui/assets/icons"
import {
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MenuSelectionItemArrow,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const Contacts: FC = () => {
  const { t } = useTranslation()

  return (
    <MenuSelectionItem>
      <MenuItemIcon component={Rectangle7101} />
      <MenuItemLabel>{t("contacts")}</MenuItemLabel>
      <MenuItemDescription>{t("contacts.description")}</MenuItemDescription>
      <MenuSelectionItemArrow />
    </MenuSelectionItem>
  )
}
