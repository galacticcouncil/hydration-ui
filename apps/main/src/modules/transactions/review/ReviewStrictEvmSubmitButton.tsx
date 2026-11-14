import { LoadingButton } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { canPresentStrict } from "@/modules/transactions/utils/strictEvm"

type ReviewStrictEvmSubmitButtonProps = {
  disabled?: boolean
}

/** Sign for a strict transaction: enabled only while the ledger lets it reach the wallet. */
export const ReviewStrictEvmSubmitButton = ({
  disabled,
}: ReviewStrictEvmSubmitButtonProps) => {
  const { t } = useTranslation()
  const { isSigning, isLoading, signAndSubmit, strictSend } = useTransaction()

  const isDisabled =
    disabled ||
    isLoading ||
    !strictSend ||
    !canPresentStrict(strictSend.state) ||
    // every pre-prompt check must be KNOWN to pass: a pending binding read is not "ok"
    strictSend.wrapRefusal !== null ||
    strictSend.refusal !== null

  return (
    <LoadingButton
      size="large"
      onClick={signAndSubmit}
      disabled={isDisabled}
      isLoading={isSigning}
      loadingVariant="tertiary"
      loadingDelay={0}
      loadingFade
    >
      {t("transaction.sign")}
    </LoadingButton>
  )
}
