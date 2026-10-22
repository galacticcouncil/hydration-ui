import { BoxProps } from "@/components/Box"
import { pxToRem } from "@/utils"

import { SIcon } from "./Icon.styled"

type IconProps = BoxProps & {
  component: React.ComponentType
}

export const Icon: React.FC<IconProps> = ({
  component: SvgComponent,
  size = 24,
  color = "currentColor",
  ...props
}) => (
  <SIcon
    color={color}
    as="span"
    size={typeof size === "number" ? pxToRem(size) : size}
    {...props}
  >
    <SvgComponent />
  </SIcon>
)
