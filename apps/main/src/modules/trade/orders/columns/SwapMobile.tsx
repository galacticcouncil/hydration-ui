import { ArrowRightLong } from "@galacticcouncil/ui/assets/icons"
import { Flex, Icon } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { AssetLabelFull } from "@/components/AssetLabelFull"
import { TAsset } from "@/providers/assetsProvider"

type Props = {
  readonly from: TAsset
  readonly to: TAsset
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
      <AssetLabelFull asset={to} withName={false} />
    </Flex>
  )
}
