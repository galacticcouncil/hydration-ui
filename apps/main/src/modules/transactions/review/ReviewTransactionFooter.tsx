import { Alert, Button, Flex, Stack } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useTransactionAlerts } from "@/modules/transactions/hooks/useTransactionAlerts"
import { ReviewTransactionSubmitButton } from "@/modules/transactions/review/ReviewTransactionSubmitButton"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionFooter = () => {
  const { t } = useTranslation()

  const { onClose, isIdle } = useTransaction()

  const { alerts } = useTransactionAlerts()

  if (isIdle) {
    return (
      <Stack width="100%" gap={10}>
        {alerts.map(({ key, ...alert }) => (
          <Alert key={key} {...alert} />
        ))}
        <Flex
          direction={["column-reverse", "row"]}
          justify="space-between"
          gap={10}
        >
          <Button size="large" variant="tertiary" onClick={onClose}>
            {t("close")}
          </Button>

          <ReviewTransactionSubmitButton />
        </Flex>
      </Stack>
    )
  }
  return (
    <Button size="large" width="100%" onClick={onClose}>
      {t("close")}
    </Button>
  )
}
