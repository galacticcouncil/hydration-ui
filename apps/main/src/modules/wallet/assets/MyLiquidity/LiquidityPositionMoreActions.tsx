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

import { Farm } from "@/api/farms"
import { JoinFarmsWrapper } from "@/modules/liquidity/components/JoinFarms"
import {
  useClaimFarmRewardsMutation,
  useClaimPositionRewards,
} from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { RemoveLiquidity } from "@/modules/liquidity/components/RemoveLiquidity"
import { AccountOmnipoolPosition, isDepositPosition } from "@/states/account"

type LiquidityPositionAction = "none" | "join" | "remove"

type Props = {
  readonly assetId: string
  readonly position: AccountOmnipoolPosition
  readonly farmsToJoin: Farm[]
}

export const LiquidityPositionMoreActions: FC<Props> = ({
  assetId,
  position,
  farmsToJoin,
}) => {
  const { t } = useTranslation("wallet")
  const [action, setAction] = useState<LiquidityPositionAction>("none")

  const isDeposit = isDepositPosition(position)
  const { claimableValues, rewards, refetch } = useClaimPositionRewards(
    isDeposit ? position : undefined,
  )
  const { mutate: claimRewards } = useClaimFarmRewardsMutation({
    claimableDeposits: rewards ?? [],
    onSuccess: () => refetch(),
  })

  const isDisabledClaiming = claimableValues.totalUSD === "0"

  return (
    <>
      {action === "none" && (
        <>
          {isDeposit && (
            <DropdownMenuItem asChild>
              <MenuSelectionItem
                variant="filterLink"
                disabled={isDisabledClaiming}
                onClick={(e) => {
                  e.preventDefault()

                  if (!isDisabledClaiming) {
                    claimRewards({ displayValue: claimableValues.totalUSD })
                  }
                }}
              >
                <MenuItemIcon component={Award} />
                <MenuItemLabel>
                  {t("myLiquidity.expanded.actions.claimRewards")}
                </MenuItemLabel>
              </MenuSelectionItem>
            </DropdownMenuItem>
          )}
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
          {/* TODO: do we need aditonal option to joind farms? */}
          {!!farmsToJoin.length && false && (
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
                  {t("myLiquidity.expanded.actions.joinFarms", {
                    count: farmsToJoin.length,
                  })}
                </MenuItemLabel>
              </MenuSelectionItem>
            </DropdownMenuItem>
          )}
        </>
      )}
      <Modal open={action === "join"} onOpenChange={() => setAction("none")}>
        <JoinFarmsWrapper
          positionId={position.positionId}
          poolId={assetId}
          closable
          onSubmitted={() => setAction("none")}
        />
      </Modal>
      <Modal open={action === "remove"} onOpenChange={() => setAction("none")}>
        <RemoveLiquidity
          poolId={assetId}
          positionId={position.positionId}
          onSubmitted={() => setAction("none")}
          closable
        />
      </Modal>
    </>
  )
}
