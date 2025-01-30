import {
  AssetLabel,
  AssetLabelProps,
  Flex,
} from "@galacticcouncil/ui/components"

import { TAssetData } from "@/api/assets"
import { Logo } from "@/components/Logo"

export const AssetLabelFull = ({
  asset,
  size,
}: {
  asset: TAssetData
  size?: AssetLabelProps["size"]
}) => {
  return (
    <Flex sx={{ gap: 8, alignItems: "center" }}>
      <Logo id={asset.id} />
      <AssetLabel symbol={asset.symbol} name={asset.name} size={size} />
    </Flex>
  )
}
