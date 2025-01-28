import { CaretDown } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Text, Tooltip } from "@galacticcouncil/ui/components"
import { ThemeColor } from "@galacticcouncil/ui/theme"
import { useEffect, useRef } from "react"
import { useTranslation } from "react-i18next"

import { RpcInfoResult } from "@/api/rpc"
import {
  SStatusOffline,
  SStatusSuccess,
} from "@/components/ProviderRpcSelect/components/RpcStatus.styled"
import { useElapsedTimeStatus } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"

export type RpcStatusProps = Partial<RpcInfoResult> & { ping?: number }

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

export const RpcStatus: React.FC<RpcStatusProps> = ({
  timestamp,
  blockNumber,
  ping = Infinity,
}) => {
  const { t } = useTranslation()

  const status = useElapsedTimeStatus(timestamp ?? 0)

  const statusText = status ? t(rpcStatusTextMap[status]) : ""

  const statusColor: ThemeColor =
    status === "online"
      ? "successGreen.400"
      : status === "slow"
        ? "utility.warningPrimary.400"
        : "utility.red.400"

  return (
    <Box>
      <Tooltip text={statusText} side="left" asChild>
        <Flex align="center" gap={4} color={statusColor}>
          <Text fs={12}>
            {t("number", {
              value: blockNumber,
            })}
          </Text>
          {status === "online" && <RpcStatusSuccess key={timestamp} />}
          {status === "slow" && <RpcStatusSlow />}
          {status === "offline" && <RpcStatusOffline />}
        </Flex>
      </Tooltip>
      {ping < Infinity && <RpcPingAverage ping={ping} />}
    </Box>
  )
}

const RpcPingAverage: React.FC<{ ping: number }> = ({ ping }) => {
  const { t } = useTranslation()

  const avgPingArrRef = useRef<number[]>([])

  useEffect(() => {
    if (ping < Infinity) {
      avgPingArrRef.current = [...avgPingArrRef.current, ping].slice(-10)
    }
  }, [ping])

  const avgPing =
    avgPingArrRef.current.length === 0
      ? ping
      : avgPingArrRef.current.reduce((acc, curr) => acc + curr, 0) /
        avgPingArrRef.current.length

  const pingColor: ThemeColor =
    avgPing < 250
      ? "successGreen.400"
      : avgPing < 500
        ? "utility.warningPrimary.400"
        : "utility.red.400"

  return (
    <Text fs={10} mt={2} color={pingColor}>
      {t("rpc.status.ping", { value: Math.round(avgPing) })}
    </Text>
  )
}
