import { Text } from "@galacticcouncil/ui/components"
import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { getToken } from "@galacticcouncil/ui/utils"

export type CallHashTextProps = {
  hash: string
}

export const CallHashText: React.FC<CallHashTextProps> = ({ hash }) => {
  const chunks = hash.split(/(0{3,})/g)

  return (
    <Text wordBreak="break-all">
      {chunks.map((str, index) => (
        <Fragment key={index}>
          <Text
            as="span"
            fs="p4"
            font="mono"
            color={
              str.startsWith("00")
                ? getToken("text.low")
                : getToken("colors.azureBlue.500")
            }
          >
            {str}
          </Text>
        </Fragment>
      ))}
    </Text>
  )
}
