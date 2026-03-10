import { Box, Stack, Text } from "@galacticcouncil/ui/components"
import { getHostnameFromUrl } from "@galacticcouncil/utils"

import { useBestNumber } from "@/api/chain"
import { useSquidUrl } from "@/api/provider"
import { SquidIndexerStatus } from "@/components/DataProviderSelect/components/squid/SquidIndexerStatus"
import { useElapsedTimeStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { ProviderProps } from "@/config/rpc"

export const StatusTooltipContent: React.FC<ProviderProps> = ({
  name,
  url,
}) => {
  const squidUrl = useSquidUrl()
  const { data } = useBestNumber()
  const { statusText } = useElapsedTimeStatus(data?.timestamp ?? 0)

  return (
    <Stack gap="m">
      <Box>
        <Text fs="p3" fw={600} truncate>
          {name || getHostnameFromUrl(url)}
        </Text>
        <Text>{statusText}</Text>
      </Box>
      <SquidIndexerStatus url={squidUrl} />
    </Stack>
  )
}
