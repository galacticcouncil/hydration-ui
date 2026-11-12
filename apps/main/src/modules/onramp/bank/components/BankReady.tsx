import { BadgeCheckIcon } from "@galacticcouncil/ui/assets/icons"
import { Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"

type BankReadyProps = {
  rails: { usd: boolean; eur: boolean }
}

/** At least one rail is open (`rails` only). Stages 2 and 3 plug in here. */
export const BankReady: FC<BankReadyProps> = ({ rails }) => {
  const { t } = useTranslation(["onramp"])

  return (
    <BankMessage
      icon={BadgeCheckIcon}
      title={t("bank.ready.title")}
      description={t("bank.ready.description")}
    >
      {(["usd", "eur"] as const).map((currency) => (
        <Flex key={currency} justify="space-between" align="center">
          <Text fs="p4">{t(`bank.ready.rail.${currency}`)}</Text>
          <Text
            fs="p4"
            color={getToken(rails[currency] ? "text.high" : "text.low")}
          >
            {rails[currency]
              ? t("bank.ready.rail.open")
              : t("bank.ready.rail.closed")}
          </Text>
        </Flex>
      ))}
      <Text fs="p5" align="center" color={getToken("text.low")}>
        {t("bank.ready.next")}
      </Text>
    </BankMessage>
  )
}
