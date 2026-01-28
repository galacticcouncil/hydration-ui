import { Alert, Button, Flex, Stack } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useTransactionAlerts } from "@/modules/transactions/hooks/useTransactionAlerts"
import { ReviewTransactionSubmitButton } from "@/modules/transactions/review/ReviewTransactionSubmitButton"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

type ReviewTransactionFooterProps = {
  closable?: boolean
}

export const ReviewTransactionFooter: React.FC<
  ReviewTransactionFooterProps
> = ({ closable = true }) => {
  const { t } = useTranslation()

  const { onClose, isIdle, isSigning, isSubmitted } = useTransaction()

  const { alerts } = useTransactionAlerts()

  const isCloseDisabled = isSigning || isSubmitted || !closable

  if (isIdle) {
    return (
      <Stack width="100%" gap="base">
        {alerts.map(({ key, ...alert }) => (
          <Alert key={key} {...alert} />
        ))}
        <Flex
          direction={["column-reverse", "row"]}
          justify="space-between"
          gap="base"
        >
          <Button
            size="large"
            variant="tertiary"
            onClick={onClose}
            disabled={isCloseDisabled}
          >
            {t("close")}
          </Button>

          <ReviewTransactionSubmitButton />
        </Flex>
      </Stack>
    )
  }

  return (
    <Button
      size="large"
      width="100%"
      onClick={onClose}
      variant={isCloseDisabled ? "tertiary" : "primary"}
      disabled={isCloseDisabled}
    >
      {t("close")}
    </Button>
  )
}
