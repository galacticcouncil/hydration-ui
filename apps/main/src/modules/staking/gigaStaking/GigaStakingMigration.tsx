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
import { useMutation } from "@tanstack/react-query"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

import { userGigaBorrowSummaryQueryKey } from "@/api/borrow"
import { gigaTotalLockedQuery } from "@/api/gigaStake"
import { stakingPositionsQuery } from "@/api/staking"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { toDecimal } from "@/utils/formatting"

export type GigaStakingMigrationProps = {
  stakeAmount: bigint
}

export const GigaStakingMigration: FC<GigaStakingMigrationProps> = ({
  stakeAmount,
}) => {
  const { t } = useTranslation("staking")
  const { native } = useAssets()
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  const stakedAmountHuman = toDecimal(stakeAmount.toString(), native.decimals)

  const mutation = useMutation({
    mutationFn: async () => {
      if (!account) throw new Error("No account connected")
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = rpc.papiClient.getUnsafeApi() as any

      const migrateTx = unsafeApi.tx.GigaHdx.migrate()

      const toasts = {
        submitted: t("gigaStaking.migrate.toasts.submitted", {
          value: stakedAmountHuman,
          symbol: native.symbol,
        }),
        success: t("gigaStaking.migrate.toasts.success", {
          value: stakedAmountHuman,
          symbol: native.symbol,
        }),
      }

      return createTransaction({
        tx: migrateTx,
        invalidateQueries: [
          userGigaBorrowSummaryQueryKey(account.address),
          gigaTotalLockedQuery(rpc).queryKey,
          stakingPositionsQuery(rpc, account.address).queryKey,
        ],
        toasts,
      })
    },
  })

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
          onClick={() => mutation.mutate()}
        >
          {t("gigaStakingMigration.cta")}
        </Button>
      </Flex>
    </Paper>
  )
}
