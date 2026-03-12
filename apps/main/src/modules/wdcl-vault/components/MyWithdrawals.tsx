import { Flex, SectionHeader, TableRowAction, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { formatNumber, formatDays, formatDate } from "../utils/format"
import { SContentCard, STableHeader, STableRow } from "../WdclVault.styled"

interface Withdrawal {
  id: number
  amountWdcl: number
  estHollar: number
  requestedDate: Date
  maxTimeRemainingDays: number
}

interface Props {
  withdrawals: Withdrawal[]
  exchangeRate: number
  apr: number
  onCancelRedeem: (requestId: number) => void
  isCancelling: boolean
}

const GRID = "1fr 1.5fr 1fr 1fr 64px"

const projectRate = (currentRate: number, apr: number, days: number) =>
  currentRate * Math.pow(1 + apr / 100, days / 365)

export const MyWithdrawals = ({ withdrawals, exchangeRate, apr, onCancelRedeem, isCancelling }: Props) => {
  return (
    <div>
      <SectionHeader title="My Withdrawals" noTopPadding />

      <SContentCard>
        <STableHeader css={{ gridTemplateColumns: GRID, gap: 12 }}>
          <Text fs="p5" fw={500} color={getToken("text.low")}>Amount</Text>
          <Text fs="p5" fw={500} color={getToken("text.low")}>Est. HOLLAR</Text>
          <Text fs="p5" fw={500} color={getToken("text.low")}>Requested</Text>
          <Text fs="p5" fw={500} color={getToken("text.low")}>Time remaining</Text>
          <span />
        </STableHeader>

        {withdrawals.map((w) => (
          <STableRow key={w.id} css={{ gridTemplateColumns: GRID, gap: 12 }}>
            <Flex gap={4} align="baseline">
              <Text fs="p4" fw={500} color={getToken("text.high")}>{formatNumber(w.amountWdcl, 0)}</Text>
              <Text fs="p6" color={getToken("text.low")}>wDCL</Text>
            </Flex>
            <Flex gap={4} align="baseline">
              <Text fs="p4" fw={500} color={getToken("text.high")}>{formatNumber(w.amountWdcl * projectRate(exchangeRate, apr, w.maxTimeRemainingDays), 2)}</Text>
              <Text fs="p6" color={getToken("text.low")}>HOLLAR</Text>
            </Flex>
            <Text fs="p4" color={getToken("text.medium")}>{formatDate(w.requestedDate)}</Text>
            <Text fs="p4" fw={600} color="accents.alert.primary">
              {formatDays(w.maxTimeRemainingDays)}
            </Text>
            <TableRowAction
              onClick={() => onCancelRedeem(w.id)}
              disabled={isCancelling}
            >
              Cancel
            </TableRowAction>
          </STableRow>
        ))}

        {withdrawals.length === 0 && (
          <Flex justify="center" sx={{ py: "xl" }}>
            <Text fs="p4" color={getToken("text.low")}>No pending withdrawals</Text>
          </Flex>
        )}
      </SContentCard>
    </div>
  )
}
