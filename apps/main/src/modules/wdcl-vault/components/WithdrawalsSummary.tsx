import { Flex, SectionHeader, Separator, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { formatNumber } from "../utils/format"
import { SContentCard, SClickableRow } from "../WdclVault.styled"

interface Props {
  myWithdrawalsHollar: number
  totalWithdrawalsHollar: number
  onToggleMyWithdrawals: () => void
  onShowQueue: () => void
}

export const WithdrawalsSummary = ({
  myWithdrawalsHollar,
  totalWithdrawalsHollar,
  onToggleMyWithdrawals,
  onShowQueue,
}: Props) => {
  return (
    <div>
      <SectionHeader title="Withdrawals" noTopPadding />

      <SContentCard>
        <Flex direction="column" gap={12}>
          <SClickableRow onClick={onToggleMyWithdrawals}>
            <Text fs="p3" color={getToken("text.medium")}>My withdrawals</Text>
            <Flex gap={6} align="baseline">
              <Text fs="h7" fw={500} color={getToken("text.high")}>
                {formatNumber(myWithdrawalsHollar, 0)}
              </Text>
              <Text fs="p5" color={getToken("text.low")}>HOLLAR</Text>
            </Flex>
          </SClickableRow>

          <Separator />

          <SClickableRow onClick={onShowQueue}>
            <Text fs="p3" color={getToken("text.medium")}>Total withdrawals</Text>
            <Flex gap={6} align="center">
              <Text fs="h7" fw={500} color={getToken("text.high")}>
                {formatNumber(totalWithdrawalsHollar, 0)}
              </Text>
              <Text fs="p5" color={getToken("text.low")}>HOLLAR</Text>
              <Text fs="p5" color="accents.info.primary">↗</Text>
            </Flex>
          </SClickableRow>
        </Flex>
      </SContentCard>
    </div>
  )
}
