import { SubmittableExtrinsic } from "@polkadot/api/types"
import { Summary } from "components/Summary/Summary"
import { Text } from "components/Typography/Text/Text"
import React, { FC } from "react"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useTransactionValues } from "./ReviewTransactionForm.utils"

type ReviewTransactionSummaryProps = {
  tx: SubmittableExtrinsic<"promise">
  transactionValues: ReturnType<typeof useTransactionValues>
  hasMultipleFeeAssets: boolean
  xcallMeta?: Record<string, string>
  openEditFeePaymentAssetModal: () => void
}

export const ReviewTransactionSummary: FC<ReviewTransactionSummaryProps> = ({
  tx,
  transactionValues,
  xcallMeta,
  hasMultipleFeeAssets,
  openEditFeePaymentAssetModal,
}) => {
  const { t } = useTranslation()
  const { displayFeePaymentValue, feePaymentMeta, era, nonce } =
    transactionValues.data || {}

  return (
    <div>
      {!!xcallMeta ? (
        <ReviewTransactionXCallSummary xcallMeta={xcallMeta} />
      ) : (
        <Summary
          rows={[
            {
              label: t("liquidity.reviewTransaction.modal.detail.cost"),
              content: !transactionValues.isLoading ? (
                <div sx={{ flex: "row", gap: 6, align: "center" }}>
                  <Text>
                    {t("liquidity.add.modal.row.transactionCostValue", {
                      amount: displayFeePaymentValue,
                      symbol: feePaymentMeta?.symbol,
                      type: "token",
                    })}
                  </Text>
                  {hasMultipleFeeAssets && (
                    <div
                      tabIndex={0}
                      role="button"
                      onClick={openEditFeePaymentAssetModal}
                      css={{ cursor: "pointer" }}
                    >
                      <Text color="brightBlue300">
                        {t("liquidity.reviewTransaction.modal.edit")}
                      </Text>
                    </div>
                  )}
                </div>
              ) : (
                <Skeleton width={100} height={16} />
              ),
            },
          ]}
        />
      )}
      <Summary
        rows={[
          {
            label: t("liquidity.reviewTransaction.modal.detail.lifetime"),
            content: tx.era.isMortalEra
              ? t("transaction.mortal.expire", {
                  date: era?.deathDate,
                })
              : t("transaction.immortal.expire"),
          },
          {
            label: t("liquidity.reviewTransaction.modal.detail.nonce"),
            content: nonce?.toString(),
          },
        ]}
      />
    </div>
  )
}

export const ReviewTransactionXCallSummary: FC<
  Pick<ReviewTransactionSummaryProps, "xcallMeta">
> = ({ xcallMeta }) => {
  const { t } = useTranslation()
  if (!xcallMeta) return null
  return (
    <Summary
      rows={[
        {
          label: t("liquidity.reviewTransaction.modal.detail.srcChainFee"),
          content: t("value.tokenWithSymbol", {
            value:
              parseFloat(xcallMeta?.srcChainFee) > 0
                ? xcallMeta?.srcChainFee
                : "-",
            symbol:
              parseFloat(xcallMeta?.srcChainFee) > 0
                ? xcallMeta?.srcChainFeeSymbol
                : "",
          }),
        },
        {
          label: t("liquidity.reviewTransaction.modal.detail.dstChainFee"),
          content: t("value.tokenWithSymbol", {
            value:
              parseFloat(xcallMeta?.dstChainFee) > 0
                ? xcallMeta?.dstChainFee
                : "-",
            symbol:
              parseFloat(xcallMeta?.dstChainFee) > 0
                ? xcallMeta?.dstChainFeeSymbol
                : "",
          }),
        },
      ]}
    />
  )
}
