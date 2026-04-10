import { Box, BoxProps } from "@/components/Box"

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
    sx={{ flexShrink: 0 }}
    css={{
      "& > *": { width: "100%", height: "100%" },
    }}
    {...props}
  >
    <SvgComponent />
  </Box>
)
