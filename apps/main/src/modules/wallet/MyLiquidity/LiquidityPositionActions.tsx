import { Farm, RemoveCancel } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const LiquidityPositionActions = () => {
  const { t } = useTranslation("wallet")

  return (
    <>
      <DropdownMenuItem asChild>
        <MenuSelectionItem variant="filterLink">
          <MenuItemIcon component={RemoveCancel} />
          <MenuItemLabel>
            {t("myLiquidity.expanded.actions.removeLiquidity")}
          </MenuItemLabel>
        </MenuSelectionItem>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuSelectionItem variant="filterLink">
          <MenuItemIcon component={Farm} />
          <MenuItemLabel>
            {t("myLiquidity.expanded.actions.joinFarms")}
          </MenuItemLabel>
        </MenuSelectionItem>
      </DropdownMenuItem>
    </>
  )
}
