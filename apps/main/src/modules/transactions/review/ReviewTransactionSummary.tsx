import { BigNumber } from "@galacticcouncil/sdk"
import { Separator, Skeleton, Stack } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { SummaryRow } from "@/components/Summary"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { useAssets } from "@/providers/assetsProvider"

const RowSeparator = () => <Separator mx="var(--modal-content-inset)" />

export const ReviewTransactionSummary = () => {
  const { t } = useTranslation()
  const {
    nonce,
    isLoadingNonce,
    feeEstimate,
    feeAssetId,
    isLoadingFeeEstimate,
    meta,
  } = useTransaction()

  const { getAsset } = useAssets()

  const feeAsset = getAsset(feeAssetId)

  const isFeeOverride = !!meta?.fee && !!meta?.feeSymbol

  return (
    <Stack
      separated
      separator={<RowSeparator />}
      sx={{ mb: "var(--modal-content-inset)" }}
    >
      {isFeeOverride ? (
        <SummaryRow
          label={t("transaction.summary.cost")}
          content={t("currency", {
            value: meta.fee,
            symbol: meta.feeSymbol,
          })}
        />
      ) : (
        <SummaryRow
          label={t("transaction.summary.cost")}
          content={
            isLoadingFeeEstimate ? (
              <Skeleton width={60} />
            ) : (
              t("currency", {
                symbol: feeAsset?.symbol,
                value:
                  feeEstimate && feeAsset
                    ? BigNumber(feeEstimate?.toString()) // @TODO replace with big.js when sdk-next is released
                        .shiftedBy(-feeAsset.decimals)
                        .toString()
                    : null,
              })
            )
          }
        />
      )}
      {meta?.dstChainFee && meta.dstChainFeeSymbol && (
        <SummaryRow
          label={t("transaction.summary.destFee")}
          content={t("currency", {
            value: meta.dstChainFee,
            symbol: meta.dstChainFeeSymbol,
          })}
        />
      )}
      <SummaryRow
        label={t("transaction.summary.nonce")}
        content={isLoadingNonce ? <Skeleton width={30} /> : nonce?.toString()}
      />
    </Stack>
  )
}
