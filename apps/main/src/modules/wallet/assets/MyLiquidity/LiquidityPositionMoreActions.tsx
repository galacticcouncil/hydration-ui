import { Award, CircleMinus, Plus } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
  Modal,
} from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { JoinFarms } from "@/modules/liquidity/components/JoinFarms"
import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"

type LiquidityPositionAction = "none" | "join" | "remove"

type Props = {
  readonly assetId: string
  readonly positionId: string
  readonly hasJoinFarm?: boolean
}

export const LiquidityPositionMoreActions: FC<Props> = ({
  assetId,
  positionId,
  hasJoinFarm,
}) => {
  const { t } = useTranslation("wallet")
  const [action, setAction] = useState<LiquidityPositionAction>("none")

  return (
    <>
      {action === "none" && (
        <>
          <DropdownMenuItem asChild>
            <MenuSelectionItem
              variant="filterLink"
              onClick={(e) => {
                e.preventDefault()
                setAction("join")
              }}
            >
              {/* TODO claim liquidity position rewards */}
              <MenuItemIcon component={Award} />
              <MenuItemLabel>
                {t("myLiquidity.expanded.actions.claimRewards")}
              </MenuItemLabel>
            </MenuSelectionItem>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <MenuSelectionItem
              variant="filterLink"
              onClick={(e) => {
                e.preventDefault()
                setAction("remove")
              }}
            >
              <MenuItemIcon component={CircleMinus} />
              <MenuItemLabel>
                {t("myLiquidity.expanded.actions.removeLiquidity")}
              </MenuItemLabel>
            </MenuSelectionItem>
          </DropdownMenuItem>
          {hasJoinFarm && (
            <DropdownMenuItem asChild>
              <MenuSelectionItem
                variant="filterLink"
                onClick={(e) => {
                  e.preventDefault()
                  setAction("join")
                }}
              >
                <MenuItemIcon component={Plus} />
                <MenuItemLabel>
                  {/* TODO show real count and hide if 0 */}
                  {t("myLiquidity.expanded.actions.joinFarms", { count: 1 })}
                </MenuItemLabel>
              </MenuSelectionItem>
            </DropdownMenuItem>
          )}
        </>
      )}
      <Modal open={action === "join"} onOpenChange={() => setAction("none")}>
        <JoinFarms positionId={positionId} poolId={assetId} />
      </Modal>
      <Modal open={action === "remove"} onOpenChange={() => setAction("none")}>
        <RemoveLiquidity poolId={assetId} positionId={positionId} />
      </Modal>
    </>
  )
}
