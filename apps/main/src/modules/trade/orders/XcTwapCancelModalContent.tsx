import { Button, ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { shortenAccountAddress } from "@galacticcouncil/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  IntentDcaOrderData,
  IntentLimitOrderData,
  XcTwapOrderInfo,
} from "@/modules/trade/orders/lib/orderData"
import { useRemoveIntent } from "@/modules/trade/orders/lib/useRemoveIntent"

type XcTwapCancelModalContentProps = {
  readonly order: IntentLimitOrderData | IntentDcaOrderData
  readonly xc: XcTwapOrderInfo
  readonly onClose: () => void
}

export const XcTwapCancelModalContent: FC<XcTwapCancelModalContentProps> = ({
  order,
  xc,
  onClose,
}) => {
  const { t } = useTranslation("trade")
  const removeIntent = useRemoveIntent()

  return (
    <>
      <ModalHeader
        align="center"
        title={t("trade.orders.xc.cancel.title")}
        description={t("trade.orders.xc.cancel.description", {
          symbol: xc.destination?.symbol ?? xc.terms.destinationAsset,
          recipient: shortenAccountAddress(xc.terms.recipient),
          refundTo: shortenAccountAddress(xc.terms.refundTo),
        })}
      />
      <ModalBody sx={{ display: "flex", justifyContent: "space-between" }}>
        <Button variant="secondary" onClick={onClose}>
          {t("trade.cancelOrder.close")}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            removeIntent.mutate(order)
            onClose()
          }}
        >
          {t("trade.orders.xc.cancel.cta")}
        </Button>
      </ModalBody>
    </>
  )
}
