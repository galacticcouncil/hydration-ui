import { CaretDown } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { PingResponse } from "@galacticcouncil/utils"
import { useTranslation } from "react-i18next"

import {
  SStatusOffline,
  SStatusSuccess,
} from "@/components/ProviderRpcSelect/components/RpcStatus.styled"
import { useElapsedTimeStatus } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"

export type RpcStatusProps = Partial<PingResponse>

export const RpcStatusSuccess = () => {
  return (
    <SStatusSuccess>
      <span />
      <svg
        width="7"
        height="7"
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
  <CaretDown sx={{ size: 7, transform: "rotate(180deg)", scale: 1.3 }} />
)

export const RpcStatusOffline = () => <SStatusOffline />

const rpcStatusTextMap = {
  // t("rpc.status.online")
  online: "rpc.status.online",
  // t("rpc.status.slow")
  slow: "rpc.status.slow",
  // t("rpc.status.offline")
  offline: "rpc.status.offline",
} as const

const statusColorMap = {
  online: "accents.success.emphasis",
  slow: "accents.alert.primary",
  offline: "accents.danger.emphasis",
} as const

export const RpcStatus: React.FC<RpcStatusProps> = ({
  timestamp,
  blockNumber,
  ping = Infinity,
}) => {
  const { t } = useTranslation()

  const status = useElapsedTimeStatus(timestamp ?? 0)
  const statusText = status ? t(rpcStatusTextMap[status]) : ""
  const statusColor = statusColorMap[status]

  return (
    <Box>
      <Tooltip text={statusText} side="left" asChild>
        <Flex align="center" gap={4} color={getToken(statusColor)}>
          {blockNumber && (
            <Text fs={12}>
              {t("number", {
                value: blockNumber,
              })}
            </Text>
          )}
          {status === "online" && <RpcStatusSuccess key={timestamp} />}
          {status === "slow" && <RpcStatusSlow />}
          {status === "offline" && <RpcStatusOffline />}
        </Flex>
      </Tooltip>
      {ping && ping < Infinity && <RpcPing ping={ping} />}
    </Box>
  )
}

const RpcPing: React.FC<{ ping: number }> = ({ ping }) => {
  const { t } = useTranslation()

  const pingColor =
    ping < 250
      ? statusColorMap.online
      : ping < 500
        ? statusColorMap.slow
        : statusColorMap.offline

  return (
    <Text fs={10} mt={2} color={getToken(pingColor)}>
      {t("rpc.status.ping", { value: Math.round(ping) })}
    </Text>
  )
}
