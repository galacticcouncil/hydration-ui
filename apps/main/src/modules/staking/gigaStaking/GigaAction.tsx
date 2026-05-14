import { Flex, Paper, Separator } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { stakingPositionsQuery } from "@/api/staking"
import { GigaStakingMigration } from "@/modules/staking/gigaStaking/GigaStakingMigration"
import { GigaStake } from "@/modules/staking/gigaStaking/stake/GigaStake"
import { GigaUnstake } from "@/modules/staking/gigaStaking/unstake/GigaUnstake"
import { SHeaderTab } from "@/modules/trade/swap/components/FormHeader/FormHeader.styled"
import { useRpcProvider } from "@/providers/rpcProvider"

const stakeOptions = ["stake", "unstake"] as const
type StakeOption = (typeof stakeOptions)[number]

export const GigaAction = () => {
  const { t } = useTranslation("staking")
  const { account } = useAccount()
  const address = account?.address ?? ""
  const [type, setType] = useState<StakeOption>("stake")

  const { data: stakingPositionsData } = useQuery(
    stakingPositionsQuery(useRpcProvider(), address),
  )

  if (stakingPositionsData?.stake) {
    return <GigaStakingMigration stakeAmount={stakingPositionsData.stake} />
  }

  return (
    <Paper asChild>
      <Flex direction="column">
        <Flex px="xl" py="m" align="center" gap="m">
          {stakeOptions.map((option) => (
            <SHeaderTab
              key={option}
              disabled={option === "unstake" && !address}
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
