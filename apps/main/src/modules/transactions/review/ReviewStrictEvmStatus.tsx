import { Button } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { TransactionStatus } from "@/components/TransactionStatus"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { getStrictStatusView } from "@/modules/transactions/utils/strictEvm"

/**
 * The status of a strict transaction after the wallet was asked. "Try again"
 * shows ONLY after an explicit 4001 with no hash (the same condition the
 * ledger and the provider's reset enforce); every other failure reads
 * "Checking - do not send again" or, when nothing reached the wallet's send,
 * "not sent", with no action. No error text or call data is shown or copied.
 */
export const ReviewStrictEvmStatus = () => {
  const { t } = useTranslation()
  const { isIdle, status, reset, strictSend } = useTransaction()

  if (isIdle) return null

  const view = getStrictStatusView(strictSend?.state)

  return (
    <TransactionStatus
      status={status}
      errorTitle={t(`transaction.strict.status.${view}.title`)}
      errorDescription={t(`transaction.strict.status.${view}.description`)}
      errorActions={
        view === "declined" ? (
          <Button
            size="micro"
            uppercase
            variant="muted"
            outline
            onClick={reset}
          >
            {t("transaction.status.error.tryAgain")}
          </Button>
        ) : undefined
      }
    />
  )
}
