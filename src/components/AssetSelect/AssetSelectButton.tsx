import { Icon } from "../Icon/Icon"
import { Text } from "../Typography/Text/Text"
import { theme } from "theme"
import { getAssetName } from "../AssetIcon/AssetIcon"
import { SSelectAssetButton } from "./AssetSelect.styled"
import { ReactComponent as ChevronDown } from "assets/icons/ChevronDown.svg"
import { u32 } from "@polkadot/types-codec"
import { useAsset } from "api/asset"

type Props = {
  onClick?: () => void
  assetId?: string | u32
}

export const AssetSelectButton = ({ onClick, assetId }: Props) => {
  const asset = useAsset(assetId)

  const icon = asset?.data?.icon
  const symbol = asset?.data?.symbol
  const name = asset?.data?.name

  return (
    <SSelectAssetButton size="small" onClick={onClick} type="button">
      <Icon icon={icon} size={30} />
      {symbol && (
        <div sx={{ flex: "column", justify: "space-between" }}>
          <Text fw={700} lh={16} color="white">
            {symbol}
          </Text>
          <Text
            fs={13}
            lh={13}
            css={{
              whiteSpace: "nowrap",
              color: `rgba(${theme.rgbColors.whiteish500}, 0.6)`,
            }}
          >
            {name || getAssetName(symbol)}
          </Text>
        </div>
      )}
      {onClick && <Icon icon={<ChevronDown />} />}
    </SSelectAssetButton>
  )
}
