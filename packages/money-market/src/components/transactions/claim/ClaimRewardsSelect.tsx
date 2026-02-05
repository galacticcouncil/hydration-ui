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
import { useMemo, useState } from "react"

import { ReserveLogo } from "@/components/primitives/ReserveLogo"
import { Reward } from "@/helpers/types"

export type ClaimRewardsSelectProps = {
  rewards: Reward[]
  setSelectedReward: (key: string) => void
  selectedReward: string
}

type ClaimRewardsSelectItemProps = {
  key: string
  label: string
  icon: React.ReactNode
  onClick?: () => void
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
    {isTrigger && <Icon size="m" component={ChevronDown} />}
  </MenuSelectionItem>
)

export const ClaimRewardsSelect: React.FC<ClaimRewardsSelectProps> = ({
  rewards = [],
  selectedReward,
  setSelectedReward,
}) => {
  const [open, setOpen] = useState(false)

  const selectItems = useMemo<ClaimRewardsSelectItemProps[]>(() => {
    return [
      {
        key: "all",
        label: "Claim all rewards",
        icon: (
          <Icon
            size="xl"
            color={getToken("accents.info.onPrimary")}
            component={BadgeDollarSign}
          />
        ),
      },
      ...rewards.map((reward) => ({
        key: reward.symbol,
        label: reward.symbol,
        icon: <ReserveLogo address={reward.rewardTokenAddress} />,
      })),
    ]
  }, [rewards])

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
        {selectItems.map((item) => (
          <DropdownMenuItem key={item.key} asChild>
            <ClaimRewardsSelectItem
              {...item}
              onClick={() => {
                setSelectedReward(item.key)
                setOpen(false)
              }}
            />
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
