import { AssetSwitcher } from "@galacticcouncil/ui/components"
import { formatNumber } from "@galacticcouncil/utils"
import BigNumber from "bignumber.js"
import { useState } from "react"

type ViewType = "default" | "reversed"

type SwapAssetSwitcherProps = {
  assetInSymbol: string
  assetOutSymbol: string
  priceInUSD: string
  priceOutUSD: string
}

export const SwapAssetSwitcher: React.FC<SwapAssetSwitcherProps> = ({
  assetInSymbol,
  assetOutSymbol,
  priceInUSD,
  priceOutUSD,
}) => {
  const [view, setView] = useState<ViewType>("default")

  const price = BigNumber(priceInUSD).gt(0)
    ? BigNumber(priceOutUSD).div(priceInUSD)
    : BigNumber(0)

  const [shownAssetIn, shownAssetOut, shownPrice] =
    view === "reversed"
      ? [
          assetOutSymbol,
          assetInSymbol,
          price.gt(0) ? BigNumber(1).div(price) : BigNumber(0),
        ]
      : [assetInSymbol, assetOutSymbol, price]

  const isPriceDisabled = shownPrice.lte(0)

  const value = isPriceDisabled
    ? "Exchange rate: - = -"
    : `1 ${shownAssetIn} = ${formatNumber(shownPrice.toString())} ${shownAssetOut}`

  return (
    <AssetSwitcher
      sx={{ mx: "var(--modal-content-inset)", mb: "xl" }}
      onValueClick={() =>
        setView((view) => (view === "default" ? "reversed" : "default"))
      }
      valueDisabled={isPriceDisabled}
      value={value}
    />
  )
}
