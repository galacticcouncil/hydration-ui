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
import { AddLiquidityModalContent } from "@/routes/liquidity/$id.add"
import { AccountOmnipoolPosition, isDepositPosition } from "@/states/account"

import {
  ShareTokenBalance,
  XYKPositionDeposit,
} from "./MyIsolatedPoolsLiquidity.data"
import { isXYKPosition, StableswapPosition } from "./MyLiquidityTable.data"

type LiquidityPositionAction = "none" | "join" | "remove" | "add"

type LiquidityPositionMoreActionsProps = {
  readonly assetId: string
  readonly position: AccountOmnipoolPosition | XYKPositionDeposit
  readonly farmsToJoin: Farm[]
}

type XYKSharesPositionMoreActionsProps = {
  readonly position: ShareTokenBalance
  readonly farmsToJoin: Farm[]
}

type StableswapPositionMoreActionsProps = {
  readonly position: StableswapPosition
}

export const LiquidityPositionMoreActions: FC<
  LiquidityPositionMoreActionsProps
> = ({ assetId, position, farmsToJoin }) => {
  const { t } = useTranslation("wallet")
  const [action, setAction] = useState<LiquidityPositionAction>("none")

  const isXyk = isXYKPosition(position)
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
          positionId={isXyk ? position.id : position.positionId}
          poolId={isXyk ? position.amm_pool_id : assetId}
          closable
          onSubmitted={() => setAction("none")}
        />
      </Modal>
      <Modal open={action === "remove"} onOpenChange={() => setAction("none")}>
        <RemoveLiquidity
          poolId={isXyk ? position.amm_pool_id : assetId}
          positionId={isXyk ? position.id : position.positionId}
          onSubmitted={() => setAction("none")}
          closable
        />
      </Modal>
    </>
  )
}

export const XYKSharesPositionMoreActions: FC<
  XYKSharesPositionMoreActionsProps
> = ({ position, farmsToJoin }) => {
  const { t } = useTranslation(["wallet", "liquidity"])
  const [action, setAction] = useState<LiquidityPositionAction>("none")

  return (
    <>
      {action === "none" && (
        <>
          {!!farmsToJoin.length && (
            <DropdownMenuItem asChild>
              <MenuSelectionItem
                variant="filterLink"
                onClick={(e) => {
                  e.preventDefault()
                  setAction("join")
                }}
              >
                <MenuItemIcon component={Plus} />
                <MenuItemLabel>{t("liquidity:joinFarms")}</MenuItemLabel>
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
              <MenuItemLabel>{t("liquidity:removeLiquidity")}</MenuItemLabel>
            </MenuSelectionItem>
          </DropdownMenuItem>
        </>
      )}
      <Modal open={action === "join"} onOpenChange={() => setAction("none")}>
        <JoinFarmsWrapper
          poolId={position.amm_pool_id}
          closable
          onSubmitted={() => setAction("none")}
        />
      </Modal>
      <Modal open={action === "remove"} onOpenChange={() => setAction("none")}>
        <RemoveLiquidity
          poolId={position.amm_pool_id}
          shareTokenId={position.meta.id}
          closable
          onSubmitted={() => setAction("none")}
        />
      </Modal>
    </>
  )
}

export const StableswapPositionMoreActions: FC<
  StableswapPositionMoreActionsProps
> = ({ position }) => {
  const { t } = useTranslation(["wallet", "liquidity"])
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
                setAction("add")
              }}
            >
              <MenuItemIcon component={Plus} />
              <MenuItemLabel>{t("liquidity:moveToOmnipool")}</MenuItemLabel>
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
              <MenuItemLabel>{t("liquidity:removeLiquidity")}</MenuItemLabel>
            </MenuSelectionItem>
          </DropdownMenuItem>
        </>
      )}
      <Modal open={action === "add"} onOpenChange={() => setAction("none")}>
        <AddLiquidityModalContent
          id={position.assetId}
          closable
          onSubmitted={() => setAction("none")}
        />
      </Modal>
      <Modal open={action === "remove"} onOpenChange={() => setAction("none")}>
        <RemoveLiquidity
          poolId={position.assetId}
          stableswapId={position.assetId}
          closable
          onSubmitted={() => setAction("none")}
        />
      </Modal>
    </>
  )
}
