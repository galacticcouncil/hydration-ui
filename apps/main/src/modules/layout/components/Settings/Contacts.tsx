import { BookOpen } from "@galacticcouncil/ui/assets/icons"
import {
  MenuItemDescription,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  MenuSelectionItemArrow,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly onClick: () => void
}

export const Contacts: FC<Props> = ({ onClick }) => {
  const { t } = useTranslation()

  return (
    <MenuSelectionItem onClick={onClick}>
      <MenuItemIcon component={BookOpen} />
      <MenuItemLabel>{t("contacts")}</MenuItemLabel>
      <MenuItemDescription>{t("contacts.description")}</MenuItemDescription>
      <MenuSelectionItemArrow />
    </MenuSelectionItem>
  )
}
