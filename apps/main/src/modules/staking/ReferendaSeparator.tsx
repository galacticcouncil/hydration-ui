import { Separator } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

export const ReferendaSeparator: FC = () => {
  return <Separator bg={getToken("surfaces.containers.low.border")} />
}
