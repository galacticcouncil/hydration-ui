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
  type WithdrawalRowState,
} from "./Withdrawals.columns"

interface Props {
  rows: WithdrawalRow[]
  showRedeemed: boolean
  onShowRedeemedChange: (next: boolean) => void
  onCancel: WithdrawalColumnHandlers["onCancel"]
  isCancelling: boolean
}

const isActive = (s: WithdrawalRowState) => s === "pending" || s === "partial"

export const WithdrawalsCard = ({
  rows,
  showRedeemed,
  onShowRedeemedChange,
  onCancel,
  isCancelling,
}: Props) => {
  const { t } = useTranslation("hdcl")
  const { isMobile, isTablet } = useBreakpoints()

  const visibleRows = useMemo(() => {
    const filtered = showRedeemed ? rows : rows.filter((r) => isActive(r.state))
    return filtered.slice().sort((a, b) => {
      const aActive = isActive(a.state)
      const bActive = isActive(b.state)
      if (aActive && !bActive) return -1
      if (!aActive && bActive) return 1
      if (aActive) return a.requestedDate.getTime() - b.requestedDate.getTime()
      return b.requestedDate.getTime() - a.requestedDate.getTime()
    })
  }, [rows, showRedeemed])

  const columns = useWithdrawalColumns({ onCancel, isCancelling })

  return (
    <Paper>
      <Flex justify="space-between" align="center" p="l">
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
