import { Farm, Trash2 } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const LiquidityPositionActions: FC = () => {
  const { t } = useTranslation("wallet")

  return (
    <>
      <DropdownMenuItem asChild>
        <MenuSelectionItem variant="filterLink">
          <MenuItemIcon component={Trash2} />
          {/* TODO remove liquidity */}
          <MenuItemLabel>
            {t("myLiquidity.expanded.actions.removeLiquidity")}
          </MenuItemLabel>
        </MenuSelectionItem>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuSelectionItem variant="filterLink">
          <MenuItemIcon component={Farm} />
          <MenuItemLabel>
            {/* TODO join farms */}
            {t("myLiquidity.expanded.actions.joinFarms")}
          </MenuItemLabel>
        </MenuSelectionItem>
      </DropdownMenuItem>
    </>
  )
}
