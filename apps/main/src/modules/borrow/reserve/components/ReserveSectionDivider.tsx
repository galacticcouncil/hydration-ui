import { Box } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

export const ReserveSectionDivider = () => (
  <Box
    bg={getToken("surfaces.themeBasePalette.background")}
    height={4}
    mx={-20}
    my={[20, 40]}
  />
)
