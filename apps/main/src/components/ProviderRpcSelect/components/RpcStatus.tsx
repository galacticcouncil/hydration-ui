import { CaretDown } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { PingResponse } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import {
  SStatusOffline,
  SStatusSuccess,
} from "@/components/ProviderRpcSelect/components/RpcStatus.styled"
import {
  useElapsedTimeStatus,
  usePingStatus,
} from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"

export type RpcStatusProps = Partial<PingResponse> & {
  url: string
  name: string
  squidUrl?: string
}

export const RpcStatusSuccess = () => {
  return (
    <SStatusSuccess>
      <span />
      <svg
        sx={{ size: "2xs" }}
        viewBox="0 0 11 11"
        fill="none"
        xmlns="http://www.w3.org/2000.svg?react"
      >
        <circle cx="5.5" cy="5.5" r="5" stroke="currentColor" />
      </svg>
    </SStatusSuccess>
  )
}

export const RpcStatusSlow = () => (
  <CaretDown sx={{ size: "2xs", transform: "rotate(180deg)", scale: 1.3 }} />
)

export const RpcStatusOffline = () => <SStatusOffline />

export const RpcStatus: React.FC<RpcStatusProps> = ({
  timestamp,
  blockNumber,
  ping = Infinity,
}) => {
  const { t } = useTranslation()

  const { status, color } = useElapsedTimeStatus(timestamp ?? 0)

  return (
    <Box>
      <Flex align="center" gap="s" color={getToken(color)}>
        {blockNumber && (
          <Text fs="p5" fw={600}>
            {t("number", {
              value: blockNumber,
            })}
          </Text>
        )}
        {status === "online" && <RpcStatusSuccess key={timestamp} />}
        {status === "degraded" && <RpcStatusSlow />}
        {status === "offline" && <RpcStatusOffline />}
      </Flex>

      {ping && ping < Infinity && <RpcPing ping={ping} />}
    </Box>
  )
}

const RpcPing: React.FC<{ ping: number }> = ({ ping }) => {
  const { t } = useTranslation()

  const { color } = usePingStatus(ping)

  return (
    <Text fs="p6" mt="xs" color={getToken(color)}>
      {t("rpc.status.ping", { value: Math.round(ping) })}
    </Text>
  )
}
