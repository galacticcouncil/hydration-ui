import Big from "big.js"
import { FC } from "react"
import { doNothing } from "remeda"

import { TradeAssetSwitcher } from "@/components/AssetSwitcher/TradeAssetSwitcher"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"

type Props = {
  readonly offer: OtcOfferTabular
}

export const TokensConversion: FC<Props> = ({ offer }) => {
  const price = new Big(offer.assetAmountOut)
    .div(offer.assetAmountIn)
    .toString()

  return (
    <TradeAssetSwitcher
      assetInId={offer.assetIn.id}
      assetOutId={offer.assetOut.id}
      price={price}
      onSwitch={doNothing}
      switcherDisabled
    />
  )
}
