import {
  ButtonTransparent,
  Flex,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useTransaction } from "@/modules/transactions/TransactionProvider"
import { useAssets } from "@/providers/assetsProvider"

export const ReviewTransactionFee = () => {
  const { t } = useTranslation(["common"])
  const { getAsset } = useAssets()

  const {
    feeEstimate,
    feeAssetId,
    isLoadingFeeEstimate,
    fee,
    setFeePaymentModalOpen,
  } = useTransaction()

  const feeAsset = getAsset(feeAssetId)

  const isFeeOverride = !!fee?.feeAmount && !!fee?.feeSymbol
  const isChangingFeeAsset = !!fee?.feePaymentAssetId

  if (isFeeOverride) {
    return (
      <Text fs="p5" fw={500} color={getToken("text.high")}>
        {t("currency", {
          value: fee.feeAmount,
          symbol: fee.feeSymbol,
        })}
      </Text>
    )
  }

  if (isLoadingFeeEstimate) {
    return (
      <Text fs="p5" fw={500} color={getToken("text.high")}>
        <Skeleton width={60} height="1em" />
      </Text>
    )
  }

  return (
    <Text fs="p5" fw={500} color={getToken("text.high")}>
      <Flex as="span" gap={4}>
        {t("approx.short")}{" "}
        {t("currency", {
          symbol: feeAsset?.symbol,
          value: feeEstimate,
        })}
        {!isChangingFeeAsset && (
          <ButtonTransparent onClick={() => setFeePaymentModalOpen(true)}>
            <Text as="span" color={getToken("accents.info.onPrimary")}>
              {t("edit")}
            </Text>
          </ButtonTransparent>
        )}
      </Flex>
    </Text>
  )
}
