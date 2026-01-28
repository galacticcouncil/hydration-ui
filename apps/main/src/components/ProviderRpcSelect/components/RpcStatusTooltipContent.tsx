import { Box, Stack, Text } from "@galacticcouncil/ui/components"

import { useBestNumber } from "@/api/chain"
import { useActiveProviderProps, useSquidUrl } from "@/api/provider"
import { SquidStatus } from "@/components/ProviderRpcSelect/components/SquidStatus"
import { useElapsedTimeStatus } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"

export const RpcStatusTooltipContent = () => {
  const squidUrl = useSquidUrl()
  const { data } = useBestNumber()
  const providerProps = useActiveProviderProps()
  const { text: statusText } = useElapsedTimeStatus(data?.timestamp ?? 0)

  if (!providerProps) return null

  const { name, url } = providerProps

  return (
    <Stack gap="base">
      <Box>
        <Text fs="p3" lh={1.4} fw={600}>
          {name || url}
        </Text>
        <Text>{statusText}</Text>
      </Box>
      <SquidStatus url={squidUrl} />
    </Stack>
  )
}
