import { Flex, FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

export type ValueDetailProps = FlexProps & {
  value: string
  subValue?: string
}

export const ValueDetail: React.FC<ValueDetailProps> = ({
  value,
  subValue,
  ...props
}) => {
  return (
    <Flex direction="column" {...props}>
      <Text fw={500}>{value}</Text>
      {subValue && (
        <Text fs={12} lh={1} color={getToken("text.low")}>
          {subValue}
        </Text>
      )}
    </Flex>
  )
}
