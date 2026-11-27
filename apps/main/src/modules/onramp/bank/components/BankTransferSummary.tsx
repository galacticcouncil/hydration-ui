import { ArrowRightIcon } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon, Paper, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

type SummarySide = {
  label: string
  value: ReactNode
  detail?: string
}

type BankTransferSummaryProps = {
  source: SummarySide
  destination: SummarySide
}

export const BankTransferSummary: FC<BankTransferSummaryProps> = ({
  source,
  destination,
}) => (
  <Paper p="l" bg="dim">
    <Flex direction={["column-reverse", "row"]} align="center" gap="m">
      <Stack minWidth={0} flex={1} gap="xs" align={["center", "start"]}>
        <Text fs="p5" color={getToken("text.medium")}>
          {source.label}
        </Text>
        <Text fs={["p4", "p3"]} fw={500} wordBreak="break-word">
          {source.value}
        </Text>
        {source.detail && (
          <Text fs="p5" color={getToken("text.low")}>
            {source.detail}
          </Text>
        )}
      </Stack>
      <Flex sx={{ display: ["none", "flex"] }} aria-hidden>
        <Icon
          component={ArrowRightIcon}
          size="s"
          color={getToken("text.low")}
        />
      </Flex>
      <Stack minWidth={0} flex={1} gap="xs" align={["center", "start"]}>
        <Text fs="p5" color={getToken("text.medium")}>
          {destination.label}
        </Text>
        <Text font="primary" fs={["h6", "p3"]} fw={500} wordBreak="break-word">
          {destination.value}
        </Text>
        {destination.detail && (
          <Text fs="p5" color={getToken("text.low")}>
            {destination.detail}
          </Text>
        )}
      </Stack>
    </Flex>
  </Paper>
)
