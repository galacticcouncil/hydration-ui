import { BoxProps } from "@/components/Box"
import { Flex } from "@/components/Flex"

type IconProps = BoxProps & {
  component: React.ComponentType
}

export const Icon: React.FC<IconProps> = ({
  component: SvgComponent,
  size = 24,
  color = "currentColor",
  ...props
}) => (
  <Flex
    color={color}
    as="span"
    inline
    align="center"
    justify="center"
    size={size}
    sx={{ flexShrink: 0 }}
    css={{
      "& > *": { width: "100%", height: "100%" },
    }}
    {...props}
  >
    <SvgComponent />
  </Flex>
)
