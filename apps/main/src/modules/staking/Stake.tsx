import { Flex, Paper, Separator } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { TAccountVote } from "@/api/democracy"
import { StakeForm } from "@/modules/staking/StakeForm"
import { UnstakeForm } from "@/modules/staking/UnstakeForm"
import { SHeaderTab } from "@/modules/trade/swap/components/FormHeader/FormHeader.styled"

const stakeOptions = ["stake", "unstake"] as const
type StakeOption = (typeof stakeOptions)[number]

type Props = {
  readonly positionId: bigint
  readonly staked: string
  readonly votes: ReadonlyArray<TAccountVote>
  readonly votesSuccess: boolean
  readonly balance: string
  readonly isLoading: boolean
}

export const Stake: FC<Props> = ({
  positionId,
  staked,
  votes,
  votesSuccess,
  balance,
  isLoading,
}) => {
  const { t } = useTranslation(["common", "staking"])
  const [type, setType] = useState<StakeOption>("stake")

  return (
    <Paper>
      <Flex
        px={getTokenPx("containers.paddings.primary")}
        py={getTokenPx("containers.paddings.tertiary")}
        align="center"
        gap={getTokenPx("scales.paddings.m")}
      >
        {stakeOptions.map((option) => (
          <SHeaderTab
            key={option}
            disabled={option === "unstake" && !positionId}
            data-status={option === type ? "active" : "inactive"}
            onClick={() => setType(option)}
          >
            {t(`staking:stake.${option}`)}
          </SHeaderTab>
        ))}
      </Flex>
      <Separator />
      {type === "stake" ? (
        <StakeForm
          positionId={positionId}
          staked={staked}
          votes={votes}
          votesSuccess={votesSuccess}
          balance={balance}
          isLoading={isLoading}
        />
      ) : (
        <UnstakeForm
          positionId={positionId}
          staked={staked}
          votes={votes}
          votesSuccess={votesSuccess}
          isLoading={isLoading}
        />
      )}
    </Paper>
  )
}
