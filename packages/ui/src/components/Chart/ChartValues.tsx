import { ReactNode } from "react"

import { Flex, FlexProps, Skeleton, Text } from "@/components"
import { getToken } from "@/utils"

export type ChartValuesProps = {
  value?: ReactNode
  displayValue?: ReactNode
  isLoading?: boolean
} & FlexProps

export const ChartValues: React.FC<ChartValuesProps> = ({
  value,
  displayValue,
  isLoading = false,
  ...props
}) => {
  return (
    <Flex direction="column" {...props}>
      {(value || isLoading) && (
        <Text fs="p3" fw={600} asChild={typeof value !== "string"}>
          {isLoading ? <Skeleton width={100} /> : value || <>&nbsp;</>}
        </Text>
      )}
      {(displayValue || isLoading) && (
        <Text
          fs="p5"
          color={getToken("text.medium")}
          asChild={typeof displayValue !== "string"}
        >
          {isLoading ? <Skeleton width={50} /> : displayValue || <>&nbsp;</>}
        </Text>
      )}
    </Flex>
  )
}
