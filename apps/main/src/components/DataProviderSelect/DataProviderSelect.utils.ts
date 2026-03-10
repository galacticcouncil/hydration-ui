import { ThemeToken } from "@galacticcouncil/ui/theme"
import {
  DataProviderStatus,
  DataProviderStatusThreshold,
  getDataProviderStatus,
} from "@galacticcouncil/utils"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useInterval } from "react-use"
import { isNumber, prop, uniqueBy } from "remeda"

import { useBestNumber } from "@/api/chain"
import { getIndexerStatus } from "@/components/DataProviderSelect/DataProviderResolver.utils"
import { SQUID_URLS } from "@/config/rpc"
import { useSquidListStore } from "@/states/provider"

const STATUS_COLOR_MAP: Record<DataProviderStatus, ThemeToken> = {
  [DataProviderStatus.HEALTHY]: "accents.success.emphasis",
  [DataProviderStatus.LAGGING]: "accents.alert.primary",
  [DataProviderStatus.DEGRADED]: "accents.danger.emphasis",
  [DataProviderStatus.OFFLINE]: "text.low",
}

const ELAPSED_TIME_STATUS_THRESHOLDS: DataProviderStatusThreshold[] = [
  { max: 32_000, status: DataProviderStatus.HEALTHY },
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

export const useFullSquidUrlList = () => {
  const { t } = useTranslation()
  const { squidList } = useSquidListStore()
  return useMemo(() => {
    const list = [
      ...SQUID_URLS.map(({ name, graphqlUrl }) => ({
        name,
        url: graphqlUrl,
        isCustom: false,
      })),
      ...squidList.map((squid, index) => ({
        ...squid,
        name:
          squid.name ?? t("rpc.change.modal.name.label", { index: index + 1 }),
        isCustom: true,
      })),
    ]

    return uniqueBy(list, prop("url"))
  }, [squidList, t])
}
