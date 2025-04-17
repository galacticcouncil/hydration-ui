import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const AssetDetailMobileModalBalancesHeader = () => {
  const { t } = useTranslation()

  return (
    <Flex py={6} justify="space-between" align="center">
      <Text fw={500} fs="p5" lh={1.2} color={getToken("text.low")}>
        {t("balances")}
      </Text>
      <Text fw={500} fs="p5" lh={1.4} color={getToken("text.low")}>
        {t("amount")}
      </Text>
    </Flex>
  )
}
