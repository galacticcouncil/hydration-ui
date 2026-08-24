import { Box, BoxProps, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { useActiveDataSourceStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"

export const SquidIndexerStatus: React.FC<Omit<BoxProps, "children">> = (
  props,
) => {
  const { name, color, statusText, statusDescription } =
    useActiveDataSourceStatus()

  return (
    <Box {...props}>
      <Flex justify="space-between" gap="base">
        <Text fs="p3" fw={600}>
          {name}
        </Text>
        <Text fs="p5" fw={600} color={getToken(color)} transform="uppercase">
          {statusText}
        </Text>
      </Flex>
      <Text>{statusDescription}</Text>
    </Box>
  )
}
