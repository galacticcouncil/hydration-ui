import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useMemo } from "react"

import { TOP_NAVBAR_BREAKPOINT } from "@/modules/layout/constants"

export const useHasTopNavbar = (): boolean => {
  const { gte } = useBreakpoints()

  return useMemo(() => gte(TOP_NAVBAR_BREAKPOINT), [gte])
}
