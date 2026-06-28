import {
  getSquidSdk,
  latestBlockHeightQuery,
} from "@galacticcouncil/indexer/squid"
import { Box, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"

import {
  useBlockHeightStatus,
  useFullSquidUrlList,
} from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { useRpcProvider } from "@/providers/rpcProvider"

export type SquidIndexerStatusProps = {
  url: string
}

export const SquidIndexerStatus: React.FC<SquidIndexerStatusProps> = ({
  url,
}) => {
  const rpcProvider = useRpcProvider()
  const squidSdk = getSquidSdk(url)

  const { data: blockHeight } = useQuery(
    latestBlockHeightQuery(squidSdk, url, rpcProvider.slotDurationMs),
  )

  const { color, statusText, statusDescription } = useBlockHeightStatus(
    blockHeight ?? null,
  )

  const squidUrlList = useFullSquidUrlList()
  const { name } = squidUrlList.find((item) => item.url === url) ?? {}

  return (
    <Box>
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
