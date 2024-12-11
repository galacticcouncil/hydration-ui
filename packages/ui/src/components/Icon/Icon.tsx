import { Box, BoxProps } from "@/components"

type IconProps = BoxProps & {
  component: React.ComponentType
}

export const Icon: React.FC<IconProps> = ({
  component: SvgComponent,
  size = 24,
  color = "currentColor",
  ...props
}) => (
  <Box
    color={color}
    size={size}
    css={{
      "& > *": { width: "100%", height: "100%" },
    }}
    {...props}
  >
    <SvgComponent />
  </Box>
)
