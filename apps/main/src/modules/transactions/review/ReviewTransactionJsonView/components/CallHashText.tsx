import { Text } from "@galacticcouncil/ui/components"
import { Fragment } from "@galacticcouncil/ui/jsx/jsx-runtime"
import { getToken } from "@galacticcouncil/ui/utils"

export type CallHashTextProps = {
  hash: string
}

export const CallHashText: React.FC<CallHashTextProps> = ({ hash }) => {
  const chunks = hash.split(/(0{3,})/g)

  return (
    <Text wordBreak="break-all" lh={1.3}>
      {chunks.map((str, index) => (
        <Fragment key={index}>
          <Text
            as="span"
            fs="p6"
            font="mono"
            fw={600}
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
