import Big from "big.js"
import { FC } from "react"

import { useSubmitCancelOtcOrder } from "@/modules/trade/otc/cancel-order/CancelOtcOrderModalContent.submit"
import { CancelTradeOrderModalContent } from "@/modules/trade/otc/cancel-order/CancelTradeOrderModalContent"
import { useInitialOtcOfferAmount } from "@/modules/trade/otc/table/columns/OfferStatusColumn.utils"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { scaleHuman } from "@/utils/formatting"

type Props = {
  readonly otcOffer: OtcOfferTabular
  readonly onBack: () => void
  readonly onClose: () => void
}

export const CancelOtcOrderModalContent: FC<Props> = ({
  otcOffer,
  onBack,
  onClose,
}) => {
  const cancelOrder = useSubmitCancelOtcOrder(otcOffer, onClose)

  const { amountOutInitial } = useInitialOtcOfferAmount(
    otcOffer.id,
    otcOffer.isPartiallyFillable,
  )

  const amountOutInitialBig = new Big(
    scaleHuman(amountOutInitial, otcOffer.assetOut.decimals),
  )

  return (
    <CancelTradeOrderModalContent
      sold={amountOutInitialBig.minus(otcOffer.assetAmountOut).toString()}
      total={amountOutInitialBig.toString()}
      symbol={otcOffer.assetOut.symbol}
      onBack={onBack}
      onSubmit={() => cancelOrder.mutate()}
    />
  )
}
