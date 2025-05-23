import { BadgeDollarSign, ChevronDown } from "@galacticcouncil/ui/assets/icons"
import {
  ButtonTransparent,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
  MenuItemLabel,
  MenuSelectionItem,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { useMemo, useState } from "react"

import { TokenIcon } from "@/components/primitives/TokenIcon"
import { Reward } from "@/helpers/types"

export type ClaimRewardsSelectProps = {
  rewards: Reward[]
  setSelectedReward: (key: string) => void
  selectedReward: string
}

type ClaimRewardsSelectItemProps = {
  label: string
  icon: React.ReactNode
  onClick: () => void
  isTrigger?: boolean
}

const ClaimRewardsSelectItem: React.FC<ClaimRewardsSelectItemProps> = ({
  label,
  icon,
  onClick,
  isTrigger = false,
}) => (
  <MenuSelectionItem
    onClick={onClick}
    sx={{ display: "flex", alignItems: "center" }}
  >
    {icon}
    <MenuItemLabel>{label}</MenuItemLabel>
    {isTrigger && <Icon size={18} component={ChevronDown} />}
  </MenuSelectionItem>
)

export const ClaimRewardsSelect: React.FC<ClaimRewardsSelectProps> = ({
  rewards = [],
  selectedReward,
  setSelectedReward,
}) => {
  const [open, setOpen] = useState(false)

  const selectItems = useMemo<
    (ClaimRewardsSelectItemProps & { key: string })[]
  >(() => {
    return [
      {
        key: "all",
        label: "Claim all rewards",
        icon: (
          <Icon
            size={24}
            color={getToken("accents.info.onPrimary")}
            component={BadgeDollarSign}
          />
        ),
        onClick: () => {
          setSelectedReward("all")
          setOpen(false)
        },
      },
      ...rewards.map((reward) => ({
        key: reward.symbol,
        label: reward.symbol,
        icon: (
          <TokenIcon id={getAssetIdFromAddress(reward.rewardTokenAddress)} />
        ),
        onClick: () => {
          setSelectedReward(reward.symbol)
          setOpen(false)
        },
      })),
    ]
  }, [rewards, setSelectedReward])

  const selectedItem = selectItems.find(({ key }) => key === selectedReward)

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        {selectedItem && (
          <ButtonTransparent
            sx={{
              bg: getToken("details.separators"),
              borderRadius: "lg",
            }}
          >
            <ClaimRewardsSelectItem {...selectedItem} isTrigger />
          </ButtonTransparent>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {selectItems.map(({ key, ...item }) => (
          <DropdownMenuItem key={key} asChild>
            <ClaimRewardsSelectItem {...item} />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
