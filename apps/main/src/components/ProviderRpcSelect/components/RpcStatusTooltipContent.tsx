import { Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"

import { useBestNumber } from "@/api/chain"
import { useSquidUrl } from "@/api/provider"
import { SquidStatus } from "@/components/ProviderRpcSelect/components/SquidStatus"
import { useElapsedTimeStatus } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"
import { ProviderProps } from "@/config/rpc"
import { useProviderRpcUrlStore } from "@/states/provider"

export const RpcStatusTooltipContent: React.FC<ProviderProps> = ({
  name,
  url,
}) => {
  const squidUrl = useSquidUrl()
  const autoMode = useProviderRpcUrlStore((state) => state.autoMode)
  const { data } = useBestNumber()
  const { text: statusText } = useElapsedTimeStatus(data?.timestamp ?? 0)

  return (
    <Stack gap="s">
      <Flex justify="space-between" gap="base">
        <Text fs="p3" fw={600} truncate>
          {name || new URL(url).hostname}
        </Text>
        {autoMode && (
          <Text fs="p6" lh={1} color={getToken("text.low")}>
            [AUTO]
          </Text>
        )}
      </Flex>
      <Text>{statusText}</Text>
      <SquidStatus url={squidUrl} />
    </Stack>
  )
}
