import { Separator } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

export const ReserveSectionDivider = () => (
  <Separator
    bg={getToken("surfaces.themeBasePalette.background")}
    mx="-xl"
    my={["xl", "xxxl"]}
  />
)
