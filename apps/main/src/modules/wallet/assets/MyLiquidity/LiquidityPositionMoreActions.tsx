import { Award, CircleMinus, Plus } from "@galacticcouncil/ui/assets/icons"
import {
  DropdownMenuItem,
  MenuItemIcon,
  MenuItemLabel,
  MenuSelectionItem,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { Farm } from "@/api/farms"
import {
  useClaimFarmRewardsMutation,
  useClaimPositionRewards,
} from "@/modules/liquidity/components/PoolsHeader/ClaimRewardsButton.utils"
import { AccountOmnipoolPosition, isDepositPosition } from "@/states/account"

import { XYKPositionDeposit } from "./MyIsolatedPoolsLiquidity.data"

export enum LiquidityPositionAction {
  Join = "Join",
  Remove = "Remove",
  Add = "add",
}

type LiquidityPositionMoreActionsProps = {
  readonly position: AccountOmnipoolPosition | XYKPositionDeposit
  readonly farmsToJoin: Farm[]
  readonly onAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
  ) => void
}

type XYKSharesPositionMoreActionsProps = {
  readonly farmsToJoin: Farm[]
  readonly onAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Join,
  ) => void
}

type StableswapPositionMoreActionsProps = {
  readonly onAction: (
    action: LiquidityPositionAction.Remove | LiquidityPositionAction.Add,
  ) => void
}

export const LiquidityPositionMoreActions: FC<
  LiquidityPositionMoreActionsProps
> = ({ position, farmsToJoin, onAction }) => {
  const { t } = useTranslation("wallet")

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
            onAction(LiquidityPositionAction.Remove)
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
              onAction(LiquidityPositionAction.Join)
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
  )
}

export const XYKSharesPositionMoreActions: FC<
  XYKSharesPositionMoreActionsProps
> = ({ farmsToJoin, onAction }) => {
  const { t } = useTranslation(["wallet", "liquidity"])

  return (
    <>
      {!!farmsToJoin.length && (
        <DropdownMenuItem asChild>
          <MenuSelectionItem
            variant="filterLink"
            onClick={(e) => {
              e.preventDefault()
              onAction(LiquidityPositionAction.Join)
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
            onAction(LiquidityPositionAction.Remove)
          }}
        >
          <MenuItemIcon component={CircleMinus} />
          <MenuItemLabel>{t("liquidity:removeLiquidity")}</MenuItemLabel>
        </MenuSelectionItem>
      </DropdownMenuItem>
    </>
  )
}

export const StableswapPositionMoreActions: FC<
  StableswapPositionMoreActionsProps
> = ({ onAction }) => {
  const { t } = useTranslation(["wallet", "liquidity"])

  return (
    <>
      <DropdownMenuItem asChild>
        <MenuSelectionItem
          variant="filterLink"
          onClick={(e) => {
            e.preventDefault()
            onAction(LiquidityPositionAction.Add)
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
            onAction(LiquidityPositionAction.Remove)
          }}
        >
          <MenuItemIcon component={CircleMinus} />
          <MenuItemLabel>{t("liquidity:removeLiquidity")}</MenuItemLabel>
        </MenuSelectionItem>
      </DropdownMenuItem>
    </>
  )
}
