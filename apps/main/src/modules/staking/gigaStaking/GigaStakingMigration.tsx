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
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { useGigaStakingMigration } from "@/modules/staking/gigaStaking/GigaStakingMigration.utils"
import { useAssets } from "@/providers/assetsProvider"
import { toDecimal } from "@/utils/formatting"

export type GigaStakingMigrationProps = {
  stakeAmount: bigint
}

export const GigaStakingMigration: FC<GigaStakingMigrationProps> = ({
  stakeAmount,
}) => {
  const { t } = useTranslation("staking")
  const { native } = useAssets()

  const stakedAmountHuman = toDecimal(stakeAmount.toString(), native.decimals)

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
            values={{ amount: stakedAmountHuman }}
            components={[
              <Text
                key="giga-migration-amount"
                as="span"
                fs="p2"
                lh="m"
                color={getToken("colors.azureBlue.400")}
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
          onClick={() => mutation.mutate(stakeAmount.toString())}
        >
          {t("gigaStakingMigration.cta")}
        </Button>
      </Flex>
    </Paper>
  )
}
