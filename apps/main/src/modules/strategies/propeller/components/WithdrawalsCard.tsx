import {
  Box,
  DataTable,
  Flex,
  Paper,
  Separator,
  TableContainer,
  Text,
  Toggle,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getToken } from "@galacticcouncil/ui/utils"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"

import { StackedTable } from "@/modules/borrow/dashboard/components/StackedTable"

import {
  useWithdrawalColumns,
  type WithdrawalColumnHandlers,
  type WithdrawalRow,
} from "./Withdrawals.columns"

interface Props {
  rows: WithdrawalRow[]
  showRedeemed: boolean
  onShowRedeemedChange: (next: boolean) => void
  onClaim: WithdrawalColumnHandlers["onClaim"]
  isClaiming: boolean
}

/**
 * A row stays "actionable" until the request is fully claimed — that covers
 * requests still waiting on the keeper, partially settled ones, and settled
 * ones the user hasn't claimed yet. Claimed rows fall under "Show Redeemed".
 */
const isActionable = (r: WithdrawalRow) => r.state !== "claimed"

export const WithdrawalsCard = ({
  rows,
  showRedeemed,
  onShowRedeemedChange,
  onClaim,
  isClaiming,
}: Props) => {
  const { t } = useTranslation("propeller")
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
    onClaim,
    isClaiming,
  })

  if (rows.length === 0) return null

  return (
    <Paper>
      <Flex justify="space-between" align="center" p="l" wrap gap="m">
        <Text as="h2" font="primary" fs="base" fw={500}>
          {t("withdrawals.title")}
        </Text>
        <Flex align="center" gap="base">
          <Text fs="p5" color={getToken("text.medium")}>
            {t("withdrawals.showRedeemed")}
          </Text>
          <Toggle
            size="medium"
            checked={showRedeemed}
            onCheckedChange={onShowRedeemedChange}
            name="show-redeemed"
          />
        </Flex>
      </Flex>
      <Separator />
      {visibleRows.length === 0 ? (
        <Box px="l" py="xl">
          <Text fs="p4" color={getToken("text.low")}>
            {showRedeemed
              ? t("withdrawals.empty.all")
              : t("withdrawals.empty.pending")}
          </Text>
        </Box>
      ) : isMobile || isTablet ? (
        <Box px="m" pb="m">
          <StackedTable data={visibleRows} columns={columns} />
        </Box>
      ) : (
        <TableContainer borderRadius="xl">
          <DataTable data={visibleRows} columns={columns} />
        </TableContainer>
      )}
    </Paper>
  )
}
