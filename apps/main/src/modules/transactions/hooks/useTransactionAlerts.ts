import { AlertProps } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { isObjectType } from "remeda"

import { useTransaction } from "@/modules/transactions/TransactionProvider"

export enum TransactionAlertFlag {
  InsufficientFeeBalance = "insufficientFeeBalance",
}

type TransactionAlert = AlertProps & {
  key: TransactionAlertFlag
}

export const useTransactionAlerts = () => {
  const { t } = useTranslation()

  const { feeEstimate, feeAssetBalance } = useTransaction()

  const isFeeBalanceInsufficient =
    feeAssetBalance && feeEstimate && Big(feeAssetBalance).lt(feeEstimate)

  const alerts: TransactionAlert[] = [
    isFeeBalanceInsufficient && {
      key: TransactionAlertFlag.InsufficientFeeBalance,
      variant: "error" as const,
      description: t("transaction.alert.insufficientFeeBalance"),
    },
  ].filter(isObjectType)

  const flags = alerts.map((alert) => alert.key)

  return { alerts, flags, hasAlerts: alerts.length > 0 }
}
