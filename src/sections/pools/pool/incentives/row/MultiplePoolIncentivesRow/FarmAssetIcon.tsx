import { u32 } from "@polkadot/types-codec"
import { useAsset } from "api/asset"
import { SIcon } from "components/AssetIcon/AssetIcon.styled"

type FarmAssetIconProps = {
  assetId: u32
  className?: string
}

export const FarmAssetIcon = ({ assetId, className }: FarmAssetIconProps) => {
  const asset = useAsset(assetId)

  return <SIcon css={className}>{asset.data?.icon}</SIcon>
}
