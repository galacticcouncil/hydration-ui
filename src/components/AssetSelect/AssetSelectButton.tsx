import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { SSelectAssetButton } from "./AssetSelect.styled"
import ChevronDown from "assets/icons/ChevronDown.svg?react"
import { useRpcProvider } from "providers/rpcProvider"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"

type Props = {
  onClick?: () => void
  assetId: string
}

export const AssetSelectButton = ({ onClick, assetId }: Props) => {
  const { assets } = useRpcProvider()
  const asset = assets.getAsset(assetId)

  const symbol = asset?.symbol
  const name = asset?.name

  let iconIds: string | string[]

  if (assets.isStableSwap(asset)) {
    iconIds = asset.assets
  } else if (assets.isBond(asset)) {
    iconIds = asset.assetId
  } else {
    iconIds = asset.id
  }

  return (
    <SSelectAssetButton
      size="small"
      onClick={(e) => {
        e.preventDefault()
        onClick?.()
      }}
    >
      {typeof iconIds === "string" ? (
        <Icon icon={<AssetLogo id={iconIds} />} size={30} />
      ) : (
        <MultipleIcons
          icons={iconIds.map((asset) => ({
            icon: <AssetLogo id={asset} />,
          }))}
        />
      )}

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
          {name}
        </Text>
      </div>

      {!!onClick && <Icon icon={<ChevronDown />} />}
    </SSelectAssetButton>
  )
}
