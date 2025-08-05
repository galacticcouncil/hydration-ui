import {
  Separator,
  Skeleton,
  Stack,
  SummaryRow,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { ReviewTransactionFee } from "@/modules/transactions/review/ReviewTransactionFee"
import { ReviewTransactionMortality } from "@/modules/transactions/review/ReviewTransactionMortality"
import { ReviewTransactionTip } from "@/modules/transactions/review/ReviewTransactionTip/ReviewTransactionTip"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { TransactionType } from "@/states/transactions"
import { HYDRATION_CHAIN_KEY } from "@/utils/consts"

const RowSeparator = () => <Separator mx="var(--modal-content-inset)" />

export const ReviewTransactionSummary = () => {
  const { t } = useTranslation(["common"])

  const { nonce, isLoadingNonce, meta } = useTransaction()

  return (
    <Stack
      separated
      separator={<RowSeparator />}
      sx={{ mb: "var(--modal-content-inset)" }}
    >
      <SummaryRow
        label={t("transaction.summary.cost.label")}
        content={<ReviewTransactionFee />}
      />
      {meta.type === TransactionType.Xcm && (
        <SummaryRow
          label={t("transaction.summary.destFee.label")}
          content={t("currency", {
            value: meta.dstChainFee,
            symbol: meta.dstChainFeeSymbol,
          })}
        />
      )}
      <SummaryRow
        label={t("transaction.summary.mortality.label")}
        content={<ReviewTransactionMortality />}
      />
      <SummaryRow
        label={t("transaction.summary.nonce.label")}
        content={isLoadingNonce ? <Skeleton width={30} /> : nonce?.toString()}
      />
      {meta.type === TransactionType.Onchain &&
        meta.srcChainKey === HYDRATION_CHAIN_KEY && (
          <SummaryRow
            label={t("transaction.summary.tip.label")}
            content={<ReviewTransactionTip />}
          />
        )}
    </Stack>
  )
}
