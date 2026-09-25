import {
  Button,
  ExternalLink,
  LoadingButton,
} from "@galacticcouncil/ui/components"
import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { useTranslation } from "react-i18next"

import { usePolkadotJSExtrinsicUrl } from "@/modules/transactions/hooks/usePolkadotJSExtrinsicUrl"
import {
  TransactionAlertFlag,
  useTransactionAlerts,
} from "@/modules/transactions/hooks/useTransactionAlerts"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { TransactionType } from "@/states/transactions"

type ReviewTransactionSubmitButtonProps = {
  disabled?: boolean
}

export const ReviewTransactionSubmitButton = ({
  disabled,
}: ReviewTransactionSubmitButtonProps) => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const {
    tx,
    meta,
    isSigning,
    signAndSubmit,
    isChangingFeePaymentAsset,
    setFeePaymentModalOpen,
  } = useTransaction()

  const { flags, hasAlerts } = useTransactionAlerts()

  const isExternalWallet =
    account?.provider === WalletProviderType.ExternalWallet
  const isIncompatibleOnChain =
    meta.type === TransactionType.Onchain && !!account?.isIncompatible

  const isSigningBlocked = isExternalWallet || isIncompatibleOnChain

  const pjsUrl = usePolkadotJSExtrinsicUrl(
    tx,
    HYDRATION_CHAIN_KEY,
    isSigningBlocked,
  )

  if (isSigningBlocked && pjsUrl) {
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
      <LoadingButton
        size="large"
        onClick={() => setFeePaymentModalOpen(true)}
        isLoading={isChangingFeePaymentAsset}
        loadingDelay={0}
      >
        {t("transaction.sign.changeFeePaymentAsset")}
      </LoadingButton>
    )
  }

  const isLoading = isSigning || isChangingFeePaymentAsset
  const isDisabled = disabled || isSigningBlocked || hasAlerts

  return (
    <LoadingButton
      size="large"
      onClick={signAndSubmit}
      disabled={isDisabled}
      isLoading={isLoading}
      loadingVariant="tertiary"
      loadingDelay={0}
      loadingFade
    >
      {t("transaction.sign")}
    </LoadingButton>
  )
}
