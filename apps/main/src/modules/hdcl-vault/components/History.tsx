import { Flex, SectionHeader, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { formatNumber, formatDays, formatDate } from "../utils/format"
import { SContentCard, STableHeader, STableRow } from "../HdclVault.styled"

interface HistoryEntry {
  id: number
  hollarReceived: number
  requestedDate: Date
  receivedDate: Date
  timeTakenDays: number
}

interface Props {
  history: HistoryEntry[]
}

export const History = ({ history }: Props) => {
  return (
    <div>
      <SectionHeader title="History" noTopPadding />

      <SContentCard>
        <STableHeader css={{ gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr", gap: 8 }}>
          <Text fs="p5" fw={500} color={getToken("text.low")}>HOLLAR received</Text>
          <Text fs="p5" fw={500} color={getToken("text.low")}>Requested</Text>
          <Text fs="p5" fw={500} color={getToken("text.low")}>Received</Text>
          <Text fs="p5" fw={500} color={getToken("text.low")} css={{ textAlign: "right" }}>Time taken</Text>
        </STableHeader>

        {history.map((h) => (
          <STableRow key={h.id} css={{ gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr", gap: 8 }}>
            <Flex gap={4} align="baseline">
              <Text fs="p4" fw={500} color="accents.success.emphasis">{formatNumber(h.hollarReceived, 0)}</Text>
              <Text fs="p6" color={getToken("text.low")}>HOLLAR</Text>
            </Flex>
            <Text fs="p4" color={getToken("text.medium")}>{formatDate(h.requestedDate)}</Text>
            <Text fs="p4" color={getToken("text.medium")}>{formatDate(h.receivedDate)}</Text>
            <Text fs="p4" fw={500} color={getToken("text.high")} css={{ textAlign: "right" }}>
              {formatDays(h.timeTakenDays)}
            </Text>
          </STableRow>
        ))}

        {history.length === 0 && (
          <Flex justify="center" sx={{ py: "xl" }}>
            <Text fs="p4" color={getToken("text.low")}>No previous withdrawals</Text>
          </Flex>
        )}
      </SContentCard>
    </div>
  )
}
