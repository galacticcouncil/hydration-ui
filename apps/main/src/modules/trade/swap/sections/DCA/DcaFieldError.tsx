import { Text, TextProps } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"

export const DcaFieldError: FC<TextProps> = (props) => {
  return (
    <Text
      font="secondary"
      fw={400}
      fs="p5"
      lh={1}
      color={getToken("accents.danger.secondary")}
      ml="auto"
      {...props}
    />
  )
}
