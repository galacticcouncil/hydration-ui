import {
  Box,
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
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { WithdrawalRowMobile } from "@/modules/strategies/bil/components/WithdrawalRowMobile"
import {
  useWithdrawalColumns,
  type WithdrawalColumnHandlers,
  type WithdrawalRow,
} from "@/modules/strategies/bil/components/Withdrawals.columns"

interface Props {
  rows: WithdrawalRow[]
  onCancel: WithdrawalColumnHandlers["onCancel"]
  isCancelling: boolean
  onClaim: WithdrawalColumnHandlers["onClaim"]
  isClaiming: boolean
  onInstantRedeem: WithdrawalColumnHandlers["onInstantRedeem"]
  isInstantRedeeming: boolean
  autoClaimEnabled: boolean
  onAutoClaimChange: (next: boolean) => void
  isAutoClaimUpdating: boolean
}

export const WithdrawalsCard = ({
  rows,
  onCancel,
  isCancelling,
  onClaim,
  isClaiming,
  onInstantRedeem,
  isInstantRedeeming,
  autoClaimEnabled,
  onAutoClaimChange,
  isAutoClaimUpdating,
}: Props) => {
  const { t } = useTranslation(["strategies", "common"])
  const { gte } = useBreakpoints()

  const visibleRows = useMemo(
    () => rows.slice().sort((a, b) => a.id - b.id),
    [rows],
  )

  const columns = useWithdrawalColumns({
    onCancel,
    isCancelling,
    onClaim,
    isClaiming,
    onInstantRedeem,
    isInstantRedeeming,
  })

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
              checked={autoClaimEnabled}
              onCheckedChange={onAutoClaimChange}
              name="auto-claim"
              disabled={isAutoClaimUpdating}
            />
          </Flex>
        </Flex>
      </Flex>
      <Separator />
      {visibleRows.length === 0 ? (
        <Box px="l" py="xl">
          <Text fs="p4" color={getToken("text.low")}>
            {t("bil.withdrawals.empty.pending")}
          </Text>
        </Box>
      ) : gte("xl") ? (
        <TableContainer borderRadius="xl">
          <DataTable data={visibleRows} columns={columns} />
        </TableContainer>
      ) : (
        <Stack gap="m" p="m">
          {visibleRows.map((row) => (
            <WithdrawalRowMobile
              key={row.id}
              row={row}
              onCancel={onCancel}
              isCancelling={isCancelling}
              onClaim={onClaim}
              isClaiming={isClaiming}
              onInstantRedeem={onInstantRedeem}
              isInstantRedeeming={isInstantRedeeming}
            />
          ))}
        </Stack>
      )}
    </Paper>
  )
}
