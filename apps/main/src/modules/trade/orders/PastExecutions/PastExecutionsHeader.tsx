import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const PastExecutionsHeader: FC = () => {
  const { t } = useTranslation("trade")

  return (
    <Flex justify="space-between" align="center" py="xl" px="l" gap="l">
      <Text fw={500} fs="p2" font="primary" color={getToken("text.high")}>
        {t("trade.orders.pastExecutions.title")}
      </Text>
    </Flex>
  )
}
