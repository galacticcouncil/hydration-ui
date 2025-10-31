import { noop } from "@galacticcouncil/utils"
import Big from "big.js"
import { FC } from "react"

import { TradeAssetSwitcher } from "@/components/AssetSwitcher/TradeAssetSwitcher"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"

type Props = {
  readonly offer: OtcOfferTabular
}

export const TokensConversion: FC<Props> = ({ offer }) => {
  const price = new Big(offer.assetAmountIn)
    .div(offer.assetAmountOut)
    .toString()

  return (
    <TradeAssetSwitcher
      assetInId={offer.assetIn.id}
      assetOutId={offer.assetOut.id}
      price={price}
      onSwitch={noop}
      switcherDisabled
    />
  )
}
