import { Text, TextProps } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

export const DcaFieldLabel: FC<TextProps> = (props) => {
  return (
    <Text fw={500} fs="p5" lh={1.2} color={getToken("text.low")} {...props} />
  )
}
