import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken, getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

export const PastExecutionsListHeader: FC = () => {
  const { t } = useTranslation()

  return (
    <Flex
      justify="space-between"
      align="center"
      py={getTokenPx("containers.paddings.quint")}
      px={getTokenPx("containers.paddings.secondary")}
    >
      <Text fw={500} fs="p6" lh={1.4} color={getToken("text.medium")}>
        {t("received")}/{t("date")}
      </Text>
      <Text fw={500} fs="p6" lh={1.4} color={getToken("text.medium")}>
        {t("price")}/{t("status")}
      </Text>
    </Flex>
  )
}
