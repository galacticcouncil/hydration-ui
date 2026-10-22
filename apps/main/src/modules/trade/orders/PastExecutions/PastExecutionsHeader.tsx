import { Chip, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly nextExecutionAt?: number | null
}

export const PastExecutionsHeader: FC<Props> = ({ nextExecutionAt }) => {
  const { t } = useTranslation("trade")

  const remainingMs = nextExecutionAt ? nextExecutionAt - Date.now() : null

  return (
    <Flex justify="space-between" align="center" py="xl" px="l" gap="l">
      <Text fw={500} fs="p2" font="primary" color={getToken("text.high")}>
        {t("trade.orders.pastExecutions.title")}
      </Text>
      {remainingMs !== null && remainingMs > 0 && (
        <Chip variant="blue">
          {t("trade.orders.pastExecutions.nextIn", { value: remainingMs })}
        </Chip>
      )}
    </Flex>
  )
}
