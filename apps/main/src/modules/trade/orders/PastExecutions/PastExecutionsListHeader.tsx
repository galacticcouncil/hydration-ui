import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  TransactionItemMobileAction,
  TransactionItemMobileContainer,
} from "@/components/TransactionItem/TransactionItemMobile"

export const PastExecutionsListHeader: FC = () => {
  const { t } = useTranslation()

  return (
    <TransactionItemMobileContainer>
      <Flex justify="space-between" align="center" flex={1} py="s" px="l">
        <Text fw={500} fs="p6" lh={1.4} color={getToken("text.medium")}>
          {t("price")}/{t("date")}
        </Text>
        <Text fw={500} fs="p6" lh={1.4} color={getToken("text.medium")}>
          {t("received")}/{t("status")}
        </Text>
      </Flex>
      <TransactionItemMobileAction />
    </TransactionItemMobileContainer>
  )
}
