import { Farm, Trash2 } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
} from "@galacticcouncil/ui/components"
import { Link } from "@tanstack/react-router"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly assetId: string
  readonly positionId: string
}

export const LiquidityPositionActions: FC<Props> = ({
  assetId,
  positionId,
}) => {
  const { t } = useTranslation("wallet")

  return (
    <>
      <DropdownMenuItem asChild>
        <MenuSelectionItem variant="filterLink" asChild>
          <Link
            to="/liquidity/$id/remove"
            params={{ id: assetId }}
            search={{ positionId }}
          >
            <MenuItemIcon component={Trash2} />
            <MenuItemLabel>
              {t("myLiquidity.expanded.actions.removeLiquidity")}
            </MenuItemLabel>
          </Link>
        </MenuSelectionItem>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuSelectionItem variant="filterLink" asChild>
          <Link
            to="/liquidity/$id/join"
            params={{ id: assetId }}
            search={{ positionId }}
          >
            <MenuItemIcon component={Farm} />
            <MenuItemLabel>
              {t("myLiquidity.expanded.actions.joinFarms")}
            </MenuItemLabel>
          </Link>
        </MenuSelectionItem>
      </DropdownMenuItem>
    </>
  )
}
