import { AlertProps } from "@galacticcouncil/ui/components"
import {
  StoredAccount,
  useAccount,
  useActiveMultisigConfig,
} from "@galacticcouncil/web3-connect"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { isObjectType } from "remeda"

import { useAccountPendingPermit } from "@/api/account"
import { useMultisigDeposit, useMultisigSignerBalance } from "@/api/multisig"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { useTransactionsStore } from "@/states/transactions"

export enum TransactionAlertFlag {
  InsufficientFeeBalance = "insufficientFeeBalance",
  PendingDispatchPermit = "pendingDispatchPermit",
  InsufficientSignerBalance = "insufficientSignerBalance",
}

type TransactionAlert = AlertProps & {
  key: TransactionAlertFlag
}

export const useTransactionAlerts = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const activeMultisigConfig = useActiveMultisigConfig()

  const { data: isPermitPending } = useAccountPendingPermit()

  const {
    feeEstimate,
    feeEstimateNative,
    feeAssetBalance,
    isUsingPermit,
    nonce,
  } = useTransaction()

  const pendingTransactions = useTransactionsStore(
    (state) => state.pendingTransactions,
  )

  const isMultisig = !!(account as StoredAccount | null)?.isMultisig
  const multisigConfig = isMultisig ? activeMultisigConfig : null

  const { data: signerBalance } = useMultisigSignerBalance()
  const { data: depositData } = useMultisigDeposit(
    multisigConfig?.signers.length ?? 0,
  )

  // For multisig, fee is paid by the signer (not the multisig account itself),
  // so skip the regular fee balance check — isSignerBalanceInsufficient covers it.
  const isFeeBalanceInsufficient =
    !isMultisig &&
    feeAssetBalance &&
    feeEstimate &&
    Big(feeAssetBalance).lt(feeEstimate)

  // For multisig: signer must cover native tx fee + multisig deposit
  const isSignerBalanceInsufficient =
    isMultisig &&
    signerBalance?.transferableHuman &&
    feeEstimateNative &&
    depositData?.depositHuman &&
    Big(signerBalance.transferableHuman).lt(
      Big(feeEstimateNative).plus(depositData.depositHuman),
    )

  const isDispatchPermitBlocked = isUsingPermit
    ? isPermitPending || pendingTransactions.some((tx) => nonce <= tx.nonce)
    : false

  const alerts: TransactionAlert[] = [
    isFeeBalanceInsufficient && {
      key: TransactionAlertFlag.InsufficientFeeBalance,
      variant: "error" as const,
      description: t("transaction.alert.insufficientFeeBalance"),
    },
    isDispatchPermitBlocked && {
      key: TransactionAlertFlag.PendingDispatchPermit,
      variant: "warning" as const,
      description: t("transaction.alert.pendingDispatchPermit"),
    },
    isSignerBalanceInsufficient && {
      key: TransactionAlertFlag.InsufficientSignerBalance,
      variant: "error" as const,
      description: t("transaction.alert.insufficientSignerBalance"),
    },
  ].filter(isObjectType)

  const flags = alerts.map((alert) => alert.key)

  return { alerts, flags, hasAlerts: alerts.length > 0 }
}
