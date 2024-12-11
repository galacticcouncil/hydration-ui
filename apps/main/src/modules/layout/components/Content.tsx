import { Box, BoxProps } from "@galacticcouncil/ui/components"

export type ContentProps = BoxProps & {
  fluid?: boolean
}

export const Content: React.FC<ContentProps> = ({
  fluid = false,
  ...props
}) => {
  return (
    <Box
      sx={{ maxWidth: fluid ? "auto" : 1100, mx: "auto" }}
      py={20}
      {...props}
    />
  )
}
