import { ArrowMigration } from "@galacticcouncil/ui/assets/icons"
import {
  Button,
  Flex,
  Icon,
  Paper,
  Separator,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import { millisecondsToHours } from "date-fns"
import { FC, useState } from "react"
import { Trans, useTranslation } from "react-i18next"

import { gigaStakeConstantsQuery } from "@/api/gigaStake"
import { useStakingRewards } from "@/hooks/data/useStakingRewards"
import { useGigaStakingMigration } from "@/modules/staking/gigaStaking/GigaStakingMigration.utils"
import { MigrateConfirmationModal } from "@/modules/staking/gigaStaking/MigrateConfirmationModal"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

export type GigaStakingMigrationProps = {
  stakeAmount: bigint
}

export const GigaStakingMigration: FC<GigaStakingMigrationProps> = ({
  stakeAmount,
}) => {
  const [isMigrateConfirmationModalOpen, setIsMigrateConfirmationModalOpen] =
    useState(false)
  const { t } = useTranslation("staking")
  const { native } = useAssets()
  const rpc = useRpcProvider()

  const { data: gigaStakeConstants } = useQuery(gigaStakeConstantsQuery(rpc))
  const cooldownPeriod = gigaStakeConstants?.cooldownPeriod
  const cooldownPeriodDays = cooldownPeriod
    ? millisecondsToHours(cooldownPeriod * rpc.slotDurationMs) / 24
    : undefined

  const { data: stakingRewards } = useStakingRewards()

  const stakedAmountHuman = toDecimal(stakeAmount.toString(), native.decimals)
  const allocatedRewards = toDecimal(
    stakingRewards?.maxRewards || "0",
    native.decimals,
  )

  const mutation = useGigaStakingMigration()

  return (
    <Paper>
      <Flex align="center" p="xl" gap="base">
        <Icon
          component={ArrowMigration}
          color={getToken("buttons.primary.high.rest")}
          size={20}
        />

        <Text
          font="primary"
          fw={500}
          fs="h7"
          lh={1}
          color={getToken("text.high")}
        >
          {t("gigaStakingMigration.title")}
        </Text>
      </Flex>
      <Separator />
      <Flex direction="column" gap="xl" p="xl">
        <Text fs="p2" lh="m" color={getToken("text.medium")}>
          <Trans
            t={t}
            i18nKey="gigaStakingMigration.lead"
            values={{
              amount: stakedAmountHuman,
              days: cooldownPeriodDays ?? "-",
              rewards: allocatedRewards,
            }}
            components={[
              <Text
                key="giga-migration-amount"
                as="span"
                fs="p2"
                lh="m"
                color={getToken("text.tint.quart")}
              />,
            ]}
          />
        </Text>

        <Text as="p" fs="p2" lh="m" color={getToken("text.medium")} mb={0}>
          {t("gigaStakingMigration.followUp")}
        </Text>

        <Button
          variant="secondary"
          size="large"
          width="100%"
          disabled={mutation.isPending}
          onClick={() => setIsMigrateConfirmationModalOpen(true)}
        >
          {t("gigaStakingMigration.cta")}
        </Button>
      </Flex>
      <MigrateConfirmationModal
        open={isMigrateConfirmationModalOpen}
        onClose={() => setIsMigrateConfirmationModalOpen(false)}
        onConfirm={() => mutation.mutate(stakeAmount.toString())}
      />
    </Paper>
  )
}
