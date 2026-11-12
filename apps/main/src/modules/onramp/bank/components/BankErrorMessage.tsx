import { CircleAlertIcon } from "@galacticcouncil/ui/assets/icons"
import { Button } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { BankMessage } from "@/modules/onramp/bank/components/BankMessage"
import { BankErrorKind } from "@/modules/onramp/bank/utils/onboarding"

type BankErrorMessageProps = {
  error: BankErrorKind
  /** Repeats a READ only; never offered for a support case. */
  onRetry: () => void
}

export const BankErrorMessage: FC<BankErrorMessageProps> = ({
  error,
  onRetry,
}) => {
  const { t } = useTranslation(["onramp"])

  return (
    <BankMessage
      icon={CircleAlertIcon}
      title={t("bank.error.title")}
      description={t(`bank.error.${error}`)}
    >
      {error !== "support" && error !== "signedOut" && (
        <Button size="large" variant="secondary" onClick={onRetry}>
          {t("bank.error.retry")}
        </Button>
      )}
    </BankMessage>
  )
}
