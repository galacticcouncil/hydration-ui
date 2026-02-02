import { Text, TextProps } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import {
  getProtocolColor,
  getProtocolLabel,
} from "@/modules/xcm/history/utils/protocols"

export type JourneyProtocolProps = TextProps & {
  protocol: string
}

export const JourneyProtocol: React.FC<JourneyProtocolProps> = ({
  protocol,
  ...props
}) => {
  const label = getProtocolLabel(protocol)
  const colorToken = getProtocolColor(protocol)

  return (
    <Text
      fw={500}
      color={colorToken ? getToken(colorToken) : getToken("text.high")}
      {...props}
    >
      {label}
    </Text>
  )
}
