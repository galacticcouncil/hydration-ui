import { Flex, Paper, Separator } from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { GigaStake } from "@/modules/staking/gigaStaking/stake/GigaStake"
import { GigaUnstake } from "@/modules/staking/gigaStaking/unstake/GigaUnstake"
import { SHeaderTab } from "@/modules/trade/swap/components/FormHeader/FormHeader.styled"

const stakeOptions = ["stake", "unstake"] as const
type StakeOption = (typeof stakeOptions)[number]

export const GigaAction = () => {
  const { t } = useTranslation("staking")
  const [type, setType] = useState<StakeOption>("stake")

  return (
    <Paper asChild>
      <Flex direction="column">
        <Flex px="xl" py="m" align="center" gap="m">
          {stakeOptions.map((option) => (
            <SHeaderTab
              key={option}
              data-status={option === type ? "active" : "inactive"}
              onClick={() => setType(option)}
            >
              {t(`gigaStaking.tabs.${option}`)}
            </SHeaderTab>
          ))}
        </Flex>

        <Separator />

        {type === "stake" ? <GigaStake /> : <GigaUnstake />}
      </Flex>
    </Paper>
  )
}
