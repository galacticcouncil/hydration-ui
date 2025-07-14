import { AlertProps } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { useTranslation } from "react-i18next"
import { isObjectType } from "remeda"

import { useTransaction } from "@/modules/transactions/TransactionProvider"

type TransactionAlert = AlertProps & {
  key: string
}

export const useTransactionAlerts = (): TransactionAlert[] => {
  const { t } = useTranslation()

  const { feeEstimate, feeAssetBalance } = useTransaction()

  const isFeeBalanceInsufficient =
    feeAssetBalance && feeEstimate && Big(feeAssetBalance).lt(feeEstimate)

  return [
    isFeeBalanceInsufficient && {
      key: "insufficientFeeBalance",
      variant: "error" as const,
      description: t("transaction.alert.insufficientFeeBalance"),
    },
  ].filter(isObjectType)
}
