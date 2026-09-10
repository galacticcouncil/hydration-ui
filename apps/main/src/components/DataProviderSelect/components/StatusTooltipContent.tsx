import { Box, Flex, Stack, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { getHostnameFromUrl } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { useBestNumber, useBlockTime } from "@/api/chain"
import {
  useElapsedTimeStatus,
  useNeckworkIndexerStatus,
} from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { ProviderProps } from "@/config/rpc"
import { useRpcProvider } from "@/providers/rpcProvider"

export const StatusTooltipContent: React.FC<ProviderProps> = ({
  name,
  url,
}) => {
  const { t } = useTranslation()
  const { isReady } = useRpcProvider()
  const { data: blockTimeMs } = useBlockTime()
  const { data } = useBestNumber()
  const { statusText } = useElapsedTimeStatus(data?.timestamp ?? 0)
  const indexer = useNeckworkIndexerStatus()

  return (
    <Stack gap="m">
      <Box>
        <Text fs="p3" fw={600} truncate>
          {name || getHostnameFromUrl(url)}
        </Text>
        <Text>{statusText}</Text>
        {isReady && blockTimeMs && (
          <Text>
            {t("rpc.status.blockTime", { value: blockTimeMs / 1000 })}
          </Text>
        )}
      </Box>
      <Box>
        <Flex justify="space-between" gap="base">
          <Text fs="p3" fw={600}>
            {indexer.name}
          </Text>
          <Text
            fs="p5"
            fw={600}
            color={getToken(indexer.color)}
            transform="uppercase"
          >
            {indexer.statusText}
          </Text>
        </Flex>
        <Text>{indexer.statusDescription}</Text>
      </Box>
    </Stack>
  )
}
