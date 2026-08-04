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

import { WithdrawalRowMobile } from "@/modules/strategies/bil/components/WithdrawalRowMobile"
import {
  useWithdrawalColumns,
  type WithdrawalRow,
} from "@/modules/strategies/bil/components/Withdrawals.columns"
import { useRedemptionQueue } from "@/modules/strategies/bil/hooks/useRedemptionQueue"
import {
  useAutoClaimEnabled,
  useVaultStats,
} from "@/modules/strategies/bil/hooks/useVaultReads"
import { useSetAutoClaim } from "@/modules/strategies/bil/hooks/useVaultWrites"

export const WithdrawalsCard = () => {
  const { t } = useTranslation(["strategies", "common"])
  const { gte } = useBreakpoints()
  const { isConnected } = useAccount()
  const evmAddress = useEvmAddress()

  const { data: stats } = useVaultStats()
  const { data: queueData } = useRedemptionQueue(evmAddress)
  const { data: autoClaimOn } = useAutoClaimEnabled(evmAddress)

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

  const columns = useWithdrawalColumns()

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
            <WithdrawalRowMobile key={row.id} row={row} />
          ))}
        </Stack>
      )}
    </Paper>
  )
}
