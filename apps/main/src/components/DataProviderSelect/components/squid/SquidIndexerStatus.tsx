import { Box, BoxProps, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import {
  useActiveIndexerStatus,
  useFullSquidUrlList,
} from "@/components/DataProviderSelect/DataProviderSelect.utils"

export const SquidIndexerStatus: React.FC<Omit<BoxProps, "children">> = (
  props,
) => {
  const { url, color, statusText, statusDescription } = useActiveIndexerStatus()

  const squidUrlList = useFullSquidUrlList()
  const { name } = squidUrlList.find((item) => item.url === url) ?? {}

  return (
    <Box {...props}>
      <Flex justify="space-between" gap="base">
        <Text fs="p3" fw={600}>
          {name || url}
        </Text>
        <Text fs="p5" fw={600} color={getToken(color)} transform="uppercase">
          {statusText}
        </Text>
      </Flex>
      <Text>{statusDescription}</Text>
    </Box>
  )
}
