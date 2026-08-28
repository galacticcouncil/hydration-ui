import { neckworkStatusQuery } from "@galacticcouncil/indexer/neckwork"
import { latestBlockHeightQuery } from "@galacticcouncil/indexer/squid"
import { ThemeToken } from "@galacticcouncil/ui/theme"
import {
  DataProviderStatus,
  DataProviderStatusThreshold,
  getDataProviderStatus,
} from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useInterval } from "react-use"
import { isNumber, prop, uniqueBy } from "remeda"

import { useBestNumber } from "@/api/chain"
import { neckworkClient, useSquidClient, useSquidUrl } from "@/api/provider"
import { getIndexerStatus } from "@/components/DataProviderSelect/DataProviderResolver.utils"
import { ENV } from "@/config/env"
import { SQUID_URLS } from "@/config/rpc"
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

export const useActiveIndexerStatus = () => {
  const neckworkEnabled = useNeckworkEnabled()
  const url = useSquidUrl()
  const squidSdk = useSquidClient()
  const urlList = useFullSquidUrlList()

  const {
    data: blockHeight,
    isLoading,
    isError,
  } = useQuery({
    ...latestBlockHeightQuery(squidSdk, url),
    enabled: !neckworkEnabled,
  })

  const blockHeightStatus = useBlockHeightStatus(blockHeight ?? null)

  return {
    name: urlList.find((item) => item.url === url)?.name ?? url,
    url,
    blockHeight: blockHeight ?? null,
    isLoading,
    isError,
    ...blockHeightStatus,
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

export const useActiveDataSourceStatus = () => {
  const neckworkEnabled = useNeckworkEnabled()
  const neckwork = useNeckworkIndexerStatus()
  const squid = useActiveIndexerStatus()

  return neckworkEnabled ? neckwork : squid
}

export const useFullSquidUrlList = () =>
  useMemo(
    () =>
      uniqueBy(
        SQUID_URLS.map(({ name, graphqlUrl }) => ({ name, url: graphqlUrl })),
        prop("url"),
      ),
    [],
  )
