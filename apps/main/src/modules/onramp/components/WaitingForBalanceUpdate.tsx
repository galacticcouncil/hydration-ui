import { Flex, Spinner, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const WaitingForBalanceUpdate = () => {
  const { t } = useTranslation(["onramp"])
  return (
    <Stack justify="center" align="center" gap="base">
      <Spinner size={90} />
      <Flex direction="column" justify="center" align="center" gap="base">
        <Text as="h2" align="center" fs="h7" fw={500} font="primary">
          {t("withdraw.tx.pending.title")}
        </Text>
        <Text fs="p5" align="center" color={getToken("text.medium")}>
          {t("withdraw.tx.pending.description")}
        </Text>
      </Flex>
    </Stack>
  )
}
