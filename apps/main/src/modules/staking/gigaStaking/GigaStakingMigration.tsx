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
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { stakingPositionsQuery } from "@/api/staking"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { toDecimal } from "@/utils/formatting"

export type GigaStakingMigrationProps = {
  onMigrate?: () => void
  isMigrateDisabled?: boolean
}

export const GigaStakingMigration: FC<GigaStakingMigrationProps> = ({
  onMigrate,
  isMigrateDisabled,
}) => {
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""
  const { t } = useTranslation("staking")

  const { data: stakingPositionsData, isPending: isStakingPositionLoading } =
    useQuery(stakingPositionsQuery(rpc, address))

  if (!isStakingPositionLoading && !stakingPositionsData) {
    return null
  }

  const stakedAmount = stakingPositionsData?.stake
    ? toDecimal(stakingPositionsData.stake, native.decimals)
    : undefined

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
            values={{ amount: stakedAmount }}
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
          disabled={isMigrateDisabled}
          onClick={onMigrate}
        >
          {t("gigaStakingMigration.cta")}
        </Button>
      </Flex>
    </Paper>
  )
}
