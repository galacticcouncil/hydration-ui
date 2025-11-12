import {
  Button,
  ExternalLink,
  LoadingButton,
} from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useTranslation } from "react-i18next"

import { usePolkadotJSExtrinsicUrl } from "@/modules/transactions/hooks/usePolkadotJSExtrinsicUrl"
import {
  TransactionAlertFlag,
  useTransactionAlerts,
} from "@/modules/transactions/hooks/useTransactionAlerts"
import { useTransaction } from "@/modules/transactions/TransactionProvider"

export const ReviewTransactionSubmitButton = () => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const {
    tx,
    isSigning,
    signAndSubmit,
    isLoadingFeeEstimate,
    setFeePaymentModalOpen,
  } = useTransaction()

  const { flags, hasAlerts } = useTransactionAlerts()

  const pjsUrl = usePolkadotJSExtrinsicUrl(tx)

  const isIncompatible = !!account?.isIncompatible

  if (isIncompatible && pjsUrl) {
    return (
      <Button size="large" asChild>
        <ExternalLink href={pjsUrl}>
          {t("transaction.sign.openInPjs")}
        </ExternalLink>
      </Button>
    )
  }

  const isInsufficientFeeBalance = flags.includes(
    TransactionAlertFlag.InsufficientFeeBalance,
  )

  if (isInsufficientFeeBalance) {
    return (
      <Button size="large" onClick={() => setFeePaymentModalOpen(true)}>
        {t("transaction.sign.changeFeePaymentAsset")}
      </Button>
    )
  }

  const isLoading = isSigning || isLoadingFeeEstimate
  const isDisabled = isIncompatible || hasAlerts || isLoading

  return (
    <LoadingButton
      size="large"
      onClick={signAndSubmit}
      disabled={isDisabled}
      isLoading={isLoading}
    >
      {t("transaction.sign")}
    </LoadingButton>
  )
}
