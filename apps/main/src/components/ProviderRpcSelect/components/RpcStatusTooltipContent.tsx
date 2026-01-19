import { Box, Stack, Text } from "@galacticcouncil/ui/components"
import { isNumber } from "remeda"

import { useBestNumber } from "@/api/chain"
import { useActiveProviderProps, useSquidUrl } from "@/api/provider"
import { SquidStatus } from "@/components/ProviderRpcSelect/components/SquidStatus"
import { useElapsedTimeStatus } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"

export const RpcStatusTooltipContent = () => {
  const squidUrl = useSquidUrl()
  const { data } = useBestNumber()
  const providerProps = useActiveProviderProps()
  const { text: statusText } = useElapsedTimeStatus(data?.timestamp ?? 0)

  const blockNumber = data?.parachainBlockNumber

  if (!providerProps || !blockNumber) return null

  const { name, url } = providerProps

  return (
    <Stack gap={10}>
      <Box>
        {(providerProps.name || providerProps.url) && (
          <Text fs={14} lh={1.4} fw={600}>
            {name || url}
          </Text>
        )}
        <Text>{statusText}</Text>
      </Box>

      {isNumber(blockNumber) && (
        <SquidStatus url={squidUrl} blockNumber={blockNumber} />
      )}
    </Stack>
  )
}
