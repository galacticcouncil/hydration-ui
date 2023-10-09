import { FC } from "react"
import { IconsWrapper } from "./MultipleIcons.styled"
import { ResponsiveValue } from "utils/responsive"
import { Icon, IconProps } from "components/Icon/Icon"

type DualAssetIconsProps = {
  size?: ResponsiveValue<number>
  icons: Array<IconProps>
}

export const MultipleIcons: FC<DualAssetIconsProps> = ({
  icons,
  size = 28,
}) => (
  <IconsWrapper size={size} sx={{ flexDirection: "row" }}>
    {icons.map((icon, index) => (
      <Icon {...icon} key={index} />
    ))}
  </IconsWrapper>
)
