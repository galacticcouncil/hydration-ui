import { Separator } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

type Props = {
  readonly voted?: boolean
}

export const ReferendaSeparator: FC<Props> = () => {
  return <Separator bg={getToken("details.borders")} mx="-l" />
}
