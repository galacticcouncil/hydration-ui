import { Button, Spinner } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionFooter = () => {
  const { t } = useTranslation()

  const { onClose, isIdle, isSigning, signAndSubmit } = useTransaction()

  if (isIdle) {
    return (
      <>
        <Button size="large" variant="tertiary" onClick={onClose}>
          {t("close")}
        </Button>
        <Button size="large" onClick={signAndSubmit} disabled={isSigning}>
          {isSigning && <Spinner />}
          {t("transaction.sign")}
        </Button>
      </>
    )
  }
  return (
    <Button size="large" width="100%" onClick={onClose}>
      {t("close")}
    </Button>
  )
}
