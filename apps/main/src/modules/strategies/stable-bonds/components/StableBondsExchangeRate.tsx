import Big from "big.js"

import { AssetSwitcher } from "@/components/AssetSwitcher/AssetSwitcher"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"

export type StableBondsExchangeRateProps = {
  order?: OtcOffer
}

export const StableBondsExchangeRate: React.FC<
  StableBondsExchangeRateProps
> = ({ order }) => {
  const depositAssetId = order?.assetIn.id ?? ""
  const receiveAssetId = order?.assetOut.id ?? ""

  const fallbackPrice = order
    ? Big(order.assetAmountOut).div(order.assetAmountIn).toString()
    : undefined

  return (
    <AssetSwitcher
      assetInId={depositAssetId}
      assetOutId={receiveAssetId}
      fallbackPrice={fallbackPrice}
    />
  )
}
