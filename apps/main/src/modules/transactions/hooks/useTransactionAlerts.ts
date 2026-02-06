import { AlertProps } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { isObjectType } from "remeda"

import { useAccountPendingPermit } from "@/api/account"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { useTransactionsStore } from "@/states/transactions"

export enum TransactionAlertFlag {
  InsufficientFeeBalance = "insufficientFeeBalance",
  PendingDispatchPermit = "pendingDispatchPermit",
}

type TransactionAlert = AlertProps & {
  key: TransactionAlertFlag
}

export const useTransactionAlerts = () => {
  const { t } = useTranslation()

  const { data: isPermitPending } = useAccountPendingPermit()

  const { feeEstimate, feeAssetBalance, isUsingPermit, nonce } =
    useTransaction()

  const pendingTransactions = useTransactionsStore(
    (state) => state.pendingTransactions,
  )

  const isFeeBalanceInsufficient =
    feeAssetBalance && feeEstimate && Big(feeAssetBalance).lt(feeEstimate)

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
  ].filter(isObjectType)

  const flags = alerts.map((alert) => alert.key)

  return { alerts, flags, hasAlerts: alerts.length > 0 }
}
