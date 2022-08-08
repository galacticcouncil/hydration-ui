import { MarginProps } from "common/styles"
import { AssetIcon, AssetIconProps } from "components/AssetIcon/AssetIcon"
import { FC } from "react"
import { IconsWrapper } from "./DualAssetIcons.styled"

type DualAssetIconsProps = {
  firstIcon: AssetIconProps
  secondIcon: AssetIconProps
} & MarginProps

export const DualAssetIcons: FC<DualAssetIconsProps> = ({
  firstIcon,
  secondIcon,
}) => (
  <IconsWrapper>
    <AssetIcon {...firstIcon} />
    <AssetIcon {...secondIcon} />
  </IconsWrapper>
)
