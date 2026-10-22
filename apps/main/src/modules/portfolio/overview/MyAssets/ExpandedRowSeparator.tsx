import { Separator } from "@galacticcouncil/ui/components"
import { FC } from "react"

export const ExpandedRowSeparator: FC = () => {
  return <Separator sx={{ mx: "calc(-1*var(--table-column-padding-x))" }} />
}
