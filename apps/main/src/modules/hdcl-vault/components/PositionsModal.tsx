import { Flex, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import {
  SModalBackdrop,
  SModalContent,
  STableHeader,
  STableRow,
} from "@/modules/hdcl-vault/HdclVault.styled"
import type { Position } from "@/modules/hdcl-vault/hooks/usePositions"
import { formatDays, formatNumber } from "@/modules/hdcl-vault/utils/format"

interface Props {
  positions: Position[]
  onClose: () => void
}

export const PositionsModal = ({ positions, onClose }: Props) => {
  return (
    <SModalBackdrop onClick={onClose}>
      <SModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Flex justify="space-between" align="center">
          <Text fs="h7" fw={500} color={getToken("text.high")}>
            Vault NFT Positions
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
          All Decentral NFT positions held by the vault
        </Text>

        <Separator sx={{ my: "base" }} />

        <STableHeader css={{ gridTemplateColumns: "0.6fr 1.4fr 1fr", gap: 8 }}>
          <Text fs="p5" fw={500} color={getToken("text.low")}>
            Position
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
            Time remaining
          </Text>
        </STableHeader>

        {positions.map((pos) => (
          <STableRow
            key={pos.id}
            css={{
              gridTemplateColumns: "0.6fr 1.4fr 1fr",
              gap: 8,
              cursor: "pointer",
            }}
          >
            <Text fs="p4" fw={500} color={getToken("text.high")}>
              #{pos.id}
            </Text>
            <Flex gap={4} align="baseline">
              <Text fs="p4" fw={500} color={getToken("text.high")}>
                {formatNumber(pos.principal, 0)}
              </Text>
              <Text fs="p6" color={getToken("text.low")}>
                HOLLAR
              </Text>
            </Flex>
            <Flex justify="flex-end" align="center" gap={6}>
              <Text fs="p4" color={getToken("text.medium")}>
                {formatDays(pos.timeRemainingDays)}
              </Text>
              <Text fs="p5" color="accents.info.primary">
                ↗
              </Text>
            </Flex>
          </STableRow>
        ))}

        {positions.length === 0 && (
          <Flex justify="center" sx={{ py: "xl" }}>
            <Text fs="p4" color={getToken("text.low")}>
              No active positions
            </Text>
          </Flex>
        )}

        <Flex justify="center" sx={{ mt: "base" }}>
          <Text fs="p6" color={getToken("text.low")}>
            Click a position to view on Subscan
          </Text>
        </Flex>
      </SModalContent>
    </SModalBackdrop>
  )
}
