import { Box, Stack, Text } from "@galacticcouncil/ui/components"
import { getHostnameFromUrl } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import { useBestNumber } from "@/api/chain"
import { SquidIndexerStatus } from "@/components/DataProviderSelect/components/squid/SquidIndexerStatus"
import { useElapsedTimeStatus } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { ProviderProps } from "@/config/rpc"
import { useRpcProvider } from "@/providers/rpcProvider"

export const StatusTooltipContent: React.FC<ProviderProps> = ({
  name,
  url,
}) => {
  const { t } = useTranslation()
  const { isApiLoaded, slotDurationMs } = useRpcProvider()
  const { data } = useBestNumber()
  const { statusText } = useElapsedTimeStatus(data?.timestamp ?? 0)

  return (
    <Stack gap="m">
      <Box>
        <Text fs="p3" fw={600} truncate>
          {name || getHostnameFromUrl(url)}
        </Text>
        <Text>{statusText}</Text>
        {isApiLoaded && (
          <Text>
            {t("rpc.status.blockTime", { value: slotDurationMs / 1000 })}
          </Text>
        )}
      </Box>
      <SquidIndexerStatus />
    </Stack>
  )
}
