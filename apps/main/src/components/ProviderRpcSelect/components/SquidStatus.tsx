import {
  getSquidSdk,
  latestBlockHeightQuery,
} from "@galacticcouncil/indexer/squid"
import { Box, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"

import {
  useBlockHeightStatus,
  useFullSquidUrlList,
} from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

export type SquidStatusProps = {
  url: string
}

export const SquidStatus: React.FC<SquidStatusProps> = ({ url }) => {
  const squidSdk = getSquidSdk(url)

  const { data: blockHeight } = useQuery(
    latestBlockHeightQuery(squidSdk, url, PARACHAIN_BLOCK_TIME),
  )

  const { color, text } = useBlockHeightStatus(blockHeight ?? 0)

  const squidUrlList = useFullSquidUrlList()
  const { name } = squidUrlList.find((item) => item.url === url) ?? {}

  return (
    <Box>
      <Text fs={14} lh={1.4} fw={600}>
        {name || url}
      </Text>
      <Text color={getToken(color)}>{text}</Text>
    </Box>
  )
}
