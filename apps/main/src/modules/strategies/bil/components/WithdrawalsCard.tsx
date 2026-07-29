import {
  DataTable,
  Flex,
  Label,
  Paper,
  Separator,
  Stack,
  TableContainer,
  Text,
  Toggle,
  Tooltip,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useAccount, useEvmAddress } from "@galacticcouncil/web3-connect"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { parseUnits } from "viem"

import { WithdrawalRowMobile } from "@/modules/strategies/bil/components/WithdrawalRowMobile"
import {
  useWithdrawalColumns,
  type WithdrawalRow,
} from "@/modules/strategies/bil/components/Withdrawals.columns"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { useRedemptionQueue } from "@/modules/strategies/bil/hooks/useRedemptionQueue"
import {
  useAutoClaimEnabled,
  useVaultStats,
} from "@/modules/strategies/bil/hooks/useVaultReads"
import {
  useCancelRedeem,
  useClaim,
  useInstantRedeemFromQueue,
  useSetAutoClaim,
} from "@/modules/strategies/bil/hooks/useVaultWrites"

export const WithdrawalsCard = () => {
  const { t } = useTranslation(["strategies", "common"])
  const { gte } = useBreakpoints()
  const { isConnected } = useAccount()
  const { bil } = useBilStrategy()
  const evmAddress = useEvmAddress()

  const { data: stats } = useVaultStats()
  const { data: queueData } = useRedemptionQueue(evmAddress)
  const { data: autoClaimOn } = useAutoClaimEnabled(evmAddress)

  const cancelMutation = useCancelRedeem()
  const claimMutation = useClaim()
  const instantRedeemQueueMutation = useInstantRedeemFromQueue()
  const setAutoClaimMutation = useSetAutoClaim()

  const exchangeRate = stats.exchangeRate
  const queue = queueData?.queue

  const visibleRows = useMemo(() => {
    const rows: WithdrawalRow[] = (queue ?? [])
      .filter((e) => e.isUser)
      .map((e) => ({
        id: e.requestId,
        amountBil: e.bilRemaining,
        estHollar: e.bilRemaining * exchangeRate,
        timeRemainingDays: e.estTimeRemainingDays,
        claimableBil: e.bilSettled,
        claimableHollar: e.hollarOwed,
      }))
    return rows.sort((a, b) => a.id - b.id)
  }, [queue, exchangeRate])

  const columns = useWithdrawalColumns({
    onCancel: (id) => cancelMutation.mutate(id),
    isCancelling: cancelMutation.isPending,
    onClaim: (claimableBil) =>
      claimMutation.mutate(parseUnits(claimableBil.toString(), bil.decimals)),
    isClaiming: claimMutation.isPending,
    onInstantRedeem: (id, amountBil) =>
      instantRedeemQueueMutation.mutate({
        requestId: id,
        bilAmount: amountBil,
      }),
    isInstantRedeeming: instantRedeemQueueMutation.isPending,
  })

  if (!isConnected || visibleRows.length === 0) return null

  return (
    <Paper>
      <Flex justify="space-between" align="center" p="l" wrap gap="m">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("bil.withdrawals.title")}
        </Text>
        <Flex align="center" gap="l" wrap>
          <Flex align="center" gap="base">
            <Tooltip text={t("bil.withdrawals.autoClaim.tooltip")} asChild>
              <Label
                fs="p5"
                color={getToken("text.medium")}
                htmlFor="auto-claim"
              >
                {t("bil.withdrawals.autoClaim")}
              </Label>
            </Tooltip>
            <Toggle
              size="medium"
              checked={autoClaimOn ?? false}
              onCheckedChange={(next) => setAutoClaimMutation.mutate(next)}
              name="auto-claim"
              disabled={setAutoClaimMutation.isPending}
            />
          </Flex>
        </Flex>
      </Flex>
      <Separator />
      {gte("xl") ? (
        <TableContainer borderRadius="xl">
          <DataTable data={visibleRows} columns={columns} />
        </TableContainer>
      ) : (
        <Stack gap="m" p="m">
          {visibleRows.map((row) => (
            <WithdrawalRowMobile
              key={row.id}
              row={row}
              onCancel={(id) => cancelMutation.mutate(id)}
              isCancelling={cancelMutation.isPending}
              onClaim={(claimableBil) =>
                claimMutation.mutate(
                  parseUnits(claimableBil.toString(), bil.decimals),
                )
              }
              isClaiming={claimMutation.isPending}
              onInstantRedeem={(id, amountBil) =>
                instantRedeemQueueMutation.mutate({
                  requestId: id,
                  bilAmount: amountBil,
                })
              }
              isInstantRedeeming={instantRedeemQueueMutation.isPending}
            />
          ))}
        </Stack>
      )}
    </Paper>
  )
}
