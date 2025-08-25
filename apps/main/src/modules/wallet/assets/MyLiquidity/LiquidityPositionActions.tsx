import { Award, CircleMinus, Plus } from "@galacticcouncil/ui/assets/icons"
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
          {/* TODO claim liquidity position rewards */}
          <Link
            to="/liquidity/$id/join"
            params={{ id: assetId }}
            search={{ positionId }}
          >
            <MenuItemIcon component={Award} />
            <MenuItemLabel>
              {t("myLiquidity.expanded.actions.claimRewards")}
            </MenuItemLabel>
          </Link>
        </MenuSelectionItem>
      </DropdownMenuItem>
      <DropdownMenuItem asChild>
        <MenuSelectionItem variant="filterLink" asChild>
          <Link
            to="/liquidity/$id/remove"
            params={{ id: assetId }}
            search={{ positionId }}
          >
            <MenuItemIcon component={CircleMinus} />
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
            <MenuItemIcon component={Plus} />
            <MenuItemLabel>
              {t("myLiquidity.expanded.actions.joinFarms")}
            </MenuItemLabel>
          </Link>
        </MenuSelectionItem>
      </DropdownMenuItem>
    </>
  )
}
