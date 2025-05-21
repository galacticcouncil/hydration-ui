import {
  ButtonTransparent,
  Flex,
  Separator,
  Skeleton,
  Stack,
  SummaryRow,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { TransactionFeePaymentAssetModal } from "@/modules/transactions/TransactionFeePaymentAssetModal"
import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { useAssets } from "@/providers/assetsProvider"

const RowSeparator = () => <Separator mx="var(--modal-content-inset)" />

export const ReviewTransactionSummary = () => {
  const { t } = useTranslation(["common"])
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
            <Text fs="p5" fw={500} color={getToken("text.high")}>
              {isLoadingFeeEstimate ? (
                <Skeleton width={60} height="1em" />
              ) : (
                <Flex as="span" gap={4}>
                  {t("currency", {
                    prefix: "≈ ",
                    symbol: feeAsset?.symbol,
                    value: feeEstimate,
                  })}
                  <TransactionFeePaymentAssetModal>
                    <ButtonTransparent
                      sx={{ color: getToken("accents.info.onPrimary") }}
                    >
                      {t("edit")}
                    </ButtonTransparent>
                  </TransactionFeePaymentAssetModal>
                </Flex>
              )}
            </Text>
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
