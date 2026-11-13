import { Alert, Stack, SummaryRow } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { isEvmCall } from "@/modules/transactions/utils/xcm"

/**
 * The review of a strict transaction: who sends it, to which contract, and
 * that it goes out exactly as prepared. No call data is shown or copied.
 */
export const ReviewStrictEvmSummary = () => {
  const { t } = useTranslation()
  const { tx, strictSend } = useTransaction()
  const refusal = strictSend?.wrapRefusal

  return (
    <Stack gap="base">
      {isEvmCall(tx) && (
        <>
          <SummaryRow label={t("transaction.strict.from")} content={tx.from} />
          <SummaryRow label={t("transaction.strict.to")} content={tx.to} />
        </>
      )}
      <Alert variant="info" description={t("transaction.strict.description")} />
      {refusal && refusal !== "pending" && (
        <Alert
          variant="error"
          description={t(`transaction.strict.wrapRefusal.${refusal}`)}
        />
      )}
    </Stack>
  )
}
