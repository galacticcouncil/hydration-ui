import { Button, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import Big from "big.js"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { useSubmitCancelOrder } from "@/modules/trade/otc/cancel-order/CancelOrderModalContent.submit"
import { useInitialOtcOfferAmount } from "@/modules/trade/otc/table/columns/OfferStatusColumn.utils"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly otcOffer: OtcOfferTabular
  readonly onBack: () => void
  readonly onClose: () => void
}

export const CancelOrderModalContent: FC<Props> = ({
  otcOffer,
  onBack,
  onClose,
}) => {
  const { t } = useTranslation(["trade", "common"])

  const cancelOrder = useSubmitCancelOrder(otcOffer, onClose)

  const { amountOutInitial } = useInitialOtcOfferAmount(
    otcOffer.id,
    otcOffer.isPartiallyFillable,
  )

  const amountOutInitialBig = new Big(
    scaleHuman(amountOutInitial, otcOffer.assetOut.decimals),
  )

  return (
    <>
      <ModalHeader
        title={t("otc.cancelOrder.title")}
        description={
          amountOutInitial
            ? t("otc.cancelOrder.recap", {
                sold: t("common:currency", {
                  value: amountOutInitialBig
                    .minus(otcOffer.assetAmountOut)
                    .toString(),
                  symbol: otcOffer.assetOut.symbol,
                }),
                total: t("common:currency", {
                  value: amountOutInitialBig.toString(),
                  symbol: otcOffer.assetOut.symbol,
                }),
              })
            : undefined
        }
      />
      <ModalBody
        sx={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          justifyItems: "start",
        }}
      >
        <Button variant="secondary" onClick={onBack}>
          {t("common:back")}
        </Button>
        <Button variant="primary" onClick={() => cancelOrder.mutate()}>
          {t("otc.cancelOrder.cta")}
        </Button>
      </ModalBody>
    </>
  )
}
