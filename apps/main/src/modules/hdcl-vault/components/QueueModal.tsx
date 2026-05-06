import { Flex, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import {
  SModalBackdrop,
  SModalContent,
  STableHeader,
  STableRow,
} from "@/modules/hdcl-vault/HdclVault.styled"
import type { QueueEntry } from "@/modules/hdcl-vault/hooks/useRedemptionQueue"
import { formatDays, formatNumber } from "@/modules/hdcl-vault/utils/format"

interface Props {
  queue: QueueEntry[]
  onClose: () => void
}

export const QueueModal = ({ queue, onClose }: Props) => {
  return (
    <SModalBackdrop onClick={onClose}>
      <SModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Flex justify="space-between" align="center">
          <Text fs="h7" fw={500} color={getToken("text.high")}>
            Withdrawal Queue
          </Text>
          <Text
            fs="h7"
            color={getToken("text.medium")}
            css={{ cursor: "pointer", padding: "0 4px", lineHeight: 1 }}
            onClick={onClose}
          >
            ×
          </Text>
        </Flex>

        <Text fs="p5" color={getToken("text.low")} sx={{ mt: "xs" }}>
          Showing all withdrawals in the queue
        </Text>

        <Separator sx={{ my: "base" }} />

        <STableHeader css={{ gridTemplateColumns: "0.5fr 1.5fr 1fr", gap: 8 }}>
          <Text fs="p5" fw={500} color={getToken("text.low")}>
            #
          </Text>
          <Text fs="p5" fw={500} color={getToken("text.low")}>
            Amount
          </Text>
          <Text
            fs="p5"
            fw={500}
            color={getToken("text.low")}
            css={{ textAlign: "right" }}
          >
            Est. time
          </Text>
        </STableHeader>

        {queue.map((entry, idx) => (
          <STableRow
            key={entry.requestId}
            css={{
              gridTemplateColumns: "0.5fr 1.5fr 1fr",
              gap: 8,
              ...(entry.isUser && {
                backgroundColor: "rgba(252, 64, 140, 0.07)",
                borderRadius: 8,
                paddingLeft: 8,
                paddingRight: 8,
              }),
            }}
          >
            <Text fs="p4" fw={500} color={getToken("text.high")}>
              {idx + 1}
            </Text>
            <Flex gap={4} align="baseline">
              <Text fs="p4" fw={500} color={getToken("text.high")}>
                {formatNumber(entry.hdclRemaining, 0)}
              </Text>
              <Text fs="p6" color={getToken("text.low")}>
                HOLLAR
              </Text>
            </Flex>
            <Text
              fs="p4"
              color={getToken("text.medium")}
              css={{ textAlign: "right" }}
            >
              {formatDays(entry.estTimeRemainingDays)}
            </Text>
          </STableRow>
        ))}

        {queue.length === 0 && (
          <Flex justify="center" sx={{ py: "xl" }}>
            <Text fs="p4" color={getToken("text.low")}>
              Queue is empty
            </Text>
          </Flex>
        )}
      </SModalContent>
    </SModalBackdrop>
  )
}
