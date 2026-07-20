import {
  Box,
  DataTable,
  Flex,
  Paper,
  Separator,
  Stack,
  TableContainer,
  Text,
  Toggle,
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
  showRedeemed: boolean
  onShowRedeemedChange: (next: boolean) => void
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

/**
 * A row stays "actionable" in the withdrawals card while either:
 *  - the queue side is still working it (state pending/partial), OR
 *  - some settled inventory hasn't been claimed yet (claimableBil > 0)
 *
 * The post-lark-2 ERC-7540 model needs the second case — `state="fulfilled"`
 * from event logs no longer implies "HOLLAR in wallet"; it means "all
 * shares queue-side settled, click Claim to receive".
 */
const isActionable = (r: WithdrawalRow) =>
  r.state === "pending" || r.state === "partial" || (r.claimableBil ?? 0) > 0

export const WithdrawalsCard = ({
  rows,
  showRedeemed,
  onShowRedeemedChange,
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
  const { isMobile, isTablet } = useBreakpoints()

  const visibleRows = useMemo(() => {
    const filtered = showRedeemed ? rows : rows.filter(isActionable)
    return filtered.slice().sort((a, b) => {
      const aActive = isActionable(a)
      const bActive = isActionable(b)
      if (aActive && !bActive) return -1
      if (!aActive && bActive) return 1
      if (aActive) return a.requestedDate.getTime() - b.requestedDate.getTime()
      return b.requestedDate.getTime() - a.requestedDate.getTime()
    })
  }, [rows, showRedeemed])

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
            <Text fs="p5" color={getToken("text.medium")}>
              {t("bil.withdrawals.autoClaim")}
            </Text>
            <Toggle
              size="medium"
              checked={autoClaimEnabled}
              onCheckedChange={onAutoClaimChange}
              name="auto-claim"
              disabled={isAutoClaimUpdating}
            />
          </Flex>
          <Flex align="center" gap="base">
            <Text fs="p5" color={getToken("text.medium")}>
              {t("bil.withdrawals.showRedeemed")}
            </Text>
            <Toggle
              size="medium"
              checked={showRedeemed}
              onCheckedChange={onShowRedeemedChange}
              name="show-redeemed"
            />
          </Flex>
        </Flex>
      </Flex>
      <Separator />
      {visibleRows.length === 0 ? (
        <Box px="l" py="xl">
          <Text fs="p4" color={getToken("text.low")}>
            {showRedeemed
              ? t("bil.withdrawals.empty.all")
              : t("bil.withdrawals.empty.pending")}
          </Text>
        </Box>
      ) : isMobile || isTablet ? (
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
      ) : (
        <TableContainer borderRadius="xl">
          <DataTable data={visibleRows} columns={columns} />
        </TableContainer>
      )}
    </Paper>
  )
}
