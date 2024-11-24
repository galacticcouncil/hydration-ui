import ChevronDown from "assets/icons/ChevronDown.svg?react"
import { ButtonTransparent } from "components/Button/Button"
import { Dropdown } from "components/Dropdown/Dropdown"
import { Text } from "components/Typography/Text/Text"
import { useMemo } from "react"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"
import { Reward } from "sections/lending/helpers/types"

export type RewardsSelectProps = {
  rewards: Reward[]
  setSelectedReward: (key: string) => void
  selectedReward: string
}

export const RewardsSelect = ({
  rewards = [],
  selectedReward,
  setSelectedReward,
}: RewardsSelectProps) => {
  const selected = rewards.find((r) => r.symbol === selectedReward) as Reward

  const items = useMemo(() => {
    return [
      {
        key: "all",
        label: "Claim all rewards",
      },
    ].concat(
      rewards.map((reward) => ({
        key: reward.symbol,
        label: reward.symbol,
      })),
    )
  }, [rewards])

  return (
    <>
      <div sx={{ flex: "row", align: "center", justify: "space-between" }}>
        <Text fs={14} color="basic400">
          Rewards(s) to claim
        </Text>
        <Dropdown
          asChild
          onSelect={({ key }) => {
            setSelectedReward(key)
          }}
          items={items}
        >
          <ButtonTransparent>
            <Text sx={{ flex: "row", align: "center", color: "brightBlue300" }}>
              {selectedReward === "all" ? (
                <span>Claim all rewards</span>
              ) : (
                <div sx={{ flex: "row", align: "center" }}>
                  <TokenIcon
                    symbol={selected.symbol}
                    size={16}
                    sx={{ mr: 8 }}
                  />
                  <span>{selected.symbol}</span>
                </div>
              )}
              <ChevronDown width={24} height={24} />
            </Text>
          </ButtonTransparent>
        </Dropdown>
      </div>
    </>
  )
}
