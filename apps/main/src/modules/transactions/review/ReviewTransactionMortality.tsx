import { Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useEstimateFutureBlockTimestamp } from "@/api/chain"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionMortality = () => {
  const { t } = useTranslation("common")

  const { mortalityPeriod } = useTransaction()

  const expirationDate = useEstimateFutureBlockTimestamp(mortalityPeriod)

  return (
    <Flex gap="xs" align="center">
      <Text fs="p5" fw={500} color={getToken("text.high")}>
        {t("approx.short")}{" "}
        {t("date.relative", {
          value: expirationDate,
        })}
      </Text>
      <Tooltip
        text={
          <>
            <Text fw={600} mb="s">
              {t("approx.short")}{" "}
              {t("date.datetime", {
                value: expirationDate,
              })}
            </Text>
            <Text>{t("transaction.summary.mortality.tooltip")}</Text>
          </>
        }
      />
    </Flex>
  )
}
