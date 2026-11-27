import { ArrowRightLong } from "@galacticcouncil/ui/assets/icons"
import { AssetLabel, Flex, Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import {
  AssetLabelFull,
  AssetLabelFullContainer,
} from "@/components/AssetLabelFull"
import { XcDestinationLogo } from "@/modules/trade/orders/columns/XcDestinationLogo"
import {
  isXcDestination,
  XcDestinationDisplay,
} from "@/modules/trade/orders/lib/orderData"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly from: TAsset
  readonly to: TAsset | XcDestinationDisplay
}

export const SwapMobile = ({ from, to }: Props) => {
  return (
    <Flex gap="s" align="center">
      <AssetLabelFull asset={from} withName={false} />
      <Icon
        size="m"
        component={ArrowRightLong}
        color={getToken("icons.onContainer")}
      />
      {isXcDestination(to) ? (
        <AssetLabelFullContainer>
          <XcDestinationLogo destination={to} />
          <AssetLabel symbol={to.symbol} />
        </AssetLabelFullContainer>
      ) : (
        <AssetLabelFull asset={to} withName={false} />
      )}
    </Flex>
  )
}
