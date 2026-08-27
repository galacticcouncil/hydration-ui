import { Flex, Spinner, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

export const PendingApproval = () => {
  const { t } = useTranslation(["xcm"])
  return (
    <Stack justify="center" align="center" gap="base">
      <Spinner size="3xl" />
      <Flex direction="column" justify="center" align="center" gap="base">
        <Text as="h2" align="center" fs="h7" fw={500} font="primary">
          {t("prerequisite.pending.title")}
        </Text>
        <Text fs="p5" align="center" color={getToken("text.medium")}>
          {t("prerequisite.pending.description")}
        </Text>
      </Flex>
    </Stack>
  )
}
