import { Flex } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, ReactNode } from "react"

import {
  SHeaderInfoLabel,
  SHeaderInfoValue,
} from "@/components/HeaderInfo/HeaderInfo.styled"

export const HeaderInfoLabel = SHeaderInfoLabel

export const HeaderInfoValue = SHeaderInfoValue

type HeaderInfoProps = {
  readonly label?: string
  readonly customLabel?: ReactNode
  readonly value?: string
  readonly customValue?: ReactNode
}

export const HeaderInfo: FC<HeaderInfoProps> = ({
  label,
  customLabel,
  value,
  customValue,
}) => {
  return (
    <Flex
      direction={["row", "column"]}
      gap={getToken("scales.paddings.s")}
      justify={["space-between", null]}
    >
      {customLabel ?? <SHeaderInfoLabel>{label}</SHeaderInfoLabel>}
      {customValue ?? <SHeaderInfoValue>{value}</SHeaderInfoValue>}
    </Flex>
  )
}
