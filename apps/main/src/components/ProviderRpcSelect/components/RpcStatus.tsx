import {
  getSquidSdk,
  latestBlockHeightQuery,
} from "@galacticcouncil/indexer/squid"
import { CaretDown } from "@galacticcouncil/ui/assets/icons"
import { Box, Flex, Stack, Text, Tooltip } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { PingResponse } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isNumber } from "remeda"

import {
  SStatusOffline,
  SStatusSuccess,
} from "@/components/ProviderRpcSelect/components/RpcStatus.styled"
import { useElapsedTimeStatus } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"
import { SQUID_URLS } from "@/config/rpc"
import { PARACHAIN_BLOCK_TIME } from "@/utils/consts"

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

const SquidStatus: React.FC<{
  name: string
  url: string
  blockNumber: number
}> = ({ name, url, blockNumber }) => {
  const { t } = useTranslation(["common"])

  const squidSdk = useMemo(() => getSquidSdk(url), [url])
  const { data: blockHeight } = useQuery(
    latestBlockHeightQuery(squidSdk, url, PARACHAIN_BLOCK_TIME / 2),
  )

  const blockHeightDifference =
    isNumber(blockNumber) && isNumber(blockHeight)
      ? blockNumber - blockHeight
      : null

  const isIndexerBehind =
    isNumber(blockHeightDifference) && blockHeightDifference > 50

  return (
    <Box>
      <Text fs={14} lh={1.4} fw={600}>
        {name}
      </Text>
      <Text
        color={
          isIndexerBehind
            ? getToken("accents.danger.emphasis")
            : getToken("accents.success.emphasis")
        }
      >
        {t("rpc.status.blockHeightDiff", {
          value: blockHeightDifference,
        })}
      </Text>
    </Box>
  )
}

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
  url,
  name,
  timestamp,
  blockNumber,
  ping = Infinity,
  squidUrl,
}) => {
  const { t } = useTranslation()

  const status = useElapsedTimeStatus(timestamp ?? 0)
  const statusText = status ? t(rpcStatusTextMap[status]) : ""
  const statusColor = statusColorMap[status]

  const currentSquidIndexer = SQUID_URLS.find((squid) => squid.url === squidUrl)

  return (
    <Box>
      <Tooltip
        text={
          <Stack gap={10}>
            {(name || url) && (
              <Text fs={14} lh={1.4} fw={600}>
                {name || url}
              </Text>
            )}
            <Text>{statusText}</Text>

            {currentSquidIndexer && isNumber(blockNumber) && (
              <SquidStatus
                name={currentSquidIndexer.name}
                url={currentSquidIndexer.url}
                blockNumber={blockNumber}
              />
            )}
          </Stack>
        }
        side="left"
        asChild
      >
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
