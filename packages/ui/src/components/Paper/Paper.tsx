import { Box, BoxProps } from "@/components/Box"
import { getToken } from "@/utils"

export type PaperProps = BoxProps

export const Paper: React.FC<PaperProps> = (props) => {
  return (
    <Box
      border={1}
      borderColor={getToken("Details.borders")}
      bg={getToken("Surfaces.themeBasePalette.surfaceHigh")}
      borderRadius="xl"
      sx={{
        boxShadow:
          "0px 3px 9px 0px rgba(0, 0, 0, 0.04), 0px 14px 37px 0px rgba(0, 0, 0, 0.04);",
      }}
      {...props}
    />
  )
}
