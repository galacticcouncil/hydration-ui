import { AssetLogo, AssetLogoProps } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { XcDestinationDisplay } from "@/modules/trade/orders/lib/orderData"

type XcDestinationLogoProps = {
  readonly destination: XcDestinationDisplay
  readonly size?: AssetLogoProps["size"]
}

export const XcDestinationLogo: FC<XcDestinationLogoProps> = ({
  destination,
  size,
}) => (
  <AssetLogo
    src={destination.logo}
    chainSrc={destination.chainLogo}
    alt={destination.symbol}
    size={size}
  />
)
