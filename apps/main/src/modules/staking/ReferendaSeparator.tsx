import { Separator } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

type Props = {
  readonly voted?: boolean
}

export const ReferendaSeparator: FC<Props> = ({ voted }) => {
  return (
    <Separator
      bg={
        voted
          ? getToken("details.borders")
          : getToken("surfaces.containers.low.border")
      }
    />
  )
}
