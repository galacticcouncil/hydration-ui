import { neckworkStatusQuery } from "@galacticcouncil/indexer/neckwork"
import { ThemeToken } from "@galacticcouncil/ui/theme"
import {
  DataProviderStatus,
  DataProviderStatusThreshold,
  getDataProviderStatus,
} from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { useInterval } from "react-use"
import { isNumber } from "remeda"

import { useBestNumber } from "@/api/chain"
import { neckworkClient } from "@/api/neckwork"
import { getIndexerStatus } from "@/components/DataProviderSelect/DataProviderResolver.utils"
import { ENV } from "@/config/env"
import { useNeckworkEnabled } from "@/states/neckwork"

const STATUS_COLOR_MAP: Record<DataProviderStatus, ThemeToken> = {
  [DataProviderStatus.HEALTHY]: "accents.success.emphasis",
  [DataProviderStatus.LAGGING]: "accents.alert.primary",
  [DataProviderStatus.DEGRADED]: "accents.danger.emphasis",
  [DataProviderStatus.OFFLINE]: "text.low",
}

const ELAPSED_TIME_STATUS_THRESHOLDS: DataProviderStatusThreshold[] = [
  { max: 45_000, status: DataProviderStatus.HEALTHY },
  { max: 120_000, status: DataProviderStatus.LAGGING },
  { max: Infinity, status: DataProviderStatus.DEGRADED },
]

const PING_STATUS_THRESHOLDS: DataProviderStatusThreshold[] = [
  { max: 250, status: DataProviderStatus.HEALTHY },
  { max: 500, status: DataProviderStatus.LAGGING },
  { max: Infinity, status: DataProviderStatus.DEGRADED },
]

export const useElapsedTimeStatus = (timestamp: number | null) => {
  const { t } = useTranslation()
  const [now, setNow] = useState(Date.now())

  useInterval(() => {
    setNow(Date.now())
  }, 1000)

  const diff = isNumber(timestamp) ? now - timestamp : null
  const status = getDataProviderStatus(diff, ELAPSED_TIME_STATUS_THRESHOLDS)

  return {
    status,
    statusText: t(`rpc.status.${status}`),
    color: STATUS_COLOR_MAP[status],
  }
}

export const usePingStatus = (ping: number | null) => {
  const status = getDataProviderStatus(ping, PING_STATUS_THRESHOLDS)

  return {
    color: STATUS_COLOR_MAP[status],
  }
}

export const useBlockHeightStatus = (blockHeight: number | null) => {
  const { t } = useTranslation()
  const { data: bestNumber } = useBestNumber()

  const { status, blockDiff } = getIndexerStatus(
    blockHeight,
    bestNumber?.parachainBlockNumber ?? null,
  )

  const blockHeightDifference =
    isNumber(bestNumber?.parachainBlockNumber) &&
    isNumber(blockHeight) &&
    bestNumber.parachainBlockNumber >= blockHeight
      ? bestNumber.parachainBlockNumber - blockHeight
      : null

  return {
    status,
    blockDiff,
    color: STATUS_COLOR_MAP[status],
    statusText: t(`rpc.indexer.status.title.${status}`),
    statusDescription: t(`rpc.indexer.status.description.${status}`),
    blockDiffText: isNumber(blockHeightDifference)
      ? t("rpc.status.blockHeightDiff", {
          count: blockHeightDifference,
        })
      : "",
  }
}

export const useNeckworkIndexerStatus = () => {
  const neckworkEnabled = useNeckworkEnabled()

  const {
    data: status,
    isLoading,
    isError,
  } = useQuery({
    ...neckworkStatusQuery(neckworkClient),
    enabled: neckworkEnabled,
  })

  const blockHeightStatus = useBlockHeightStatus(status?.blockHeight ?? null)

  return {
    name: "Neckwork",
    url: ENV.VITE_NECKWORK_URL,
    blockHeight: status?.blockHeight ?? null,
    isLoading,
    isError,
    ...blockHeightStatus,
  }
}
