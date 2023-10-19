import { FC, ReactElement, useMemo } from "react"
import { IconsWrapper } from "./MultipleIcons.styled"
import { ResponsiveValue } from "utils/responsive"
import { Icon, IconProps } from "components/Icon/Icon"
import { useRpcProvider } from "providers/rpcProvider"

type DualAssetIconsProps = {
  size?: ResponsiveValue<number>
  icons: Array<IconProps>
}

export const MultipleIcons: FC<DualAssetIconsProps> = ({
  icons,
  size = 28,
}) => {
  const { assets } = useRpcProvider()

  const maskConfig = useMemo(() => {
    const iconIds = icons.map((props) => {
      const icon = props.icon as ReactElement<{ id?: string }>
      return icon.props.id || ""
    })

    const assetProps = assets.getAssets(iconIds)
    return assetProps.map(({ parachainId }) => Boolean(parachainId))
  }, [assets, icons])

  return (
    <IconsWrapper
      size={size}
      maskConfig={maskConfig}
      sx={{ flexDirection: "row" }}
    >
      {icons.map((icon, index) => (
        <Icon {...icon} key={index} />
      ))}
    </IconsWrapper>
  )
}
