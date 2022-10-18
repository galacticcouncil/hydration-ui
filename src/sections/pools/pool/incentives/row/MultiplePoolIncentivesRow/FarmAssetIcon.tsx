import { CSSObject } from "@emotion/react"
import { u32 } from "@polkadot/types-codec"
import { useAsset } from "api/asset"
import { SIcon } from "components/AssetIcon/AssetIcon.styled"

type FarmAssetIconProps = {
  assetId: u32
  styles: CSSObject
}

const FarmAssetIcon = ({ assetId, styles }: FarmAssetIconProps) => {
  const asset = useAsset(assetId)

  return (
    <SIcon css={{ position: "relative", ...styles }}>{asset.data?.icon}</SIcon>
  )
}

export default FarmAssetIcon
