import { ThemeToken } from "@galacticcouncil/ui/theme"
import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useInterval } from "react-use"
import { isNumber, prop, uniqueBy } from "remeda"

import { useBestNumber } from "@/api/chain"
import { SQUID_URLS } from "@/config/rpc"
import { useSquidListStore } from "@/states/provider"

type ServiceStatus = "online" | "degraded" | "offline"

const statusColorMap: Record<ServiceStatus, ThemeToken> = {
  online: "accents.success.emphasis",
  degraded: "accents.alert.primary",
  offline: "accents.danger.emphasis",
}

const ELAPSED_TIME_ONLINE_THRESHOLD_MS = 32_000
const ELAPSED_TIME_DEGRADED_THRESHOLD_MS = 120_000

const PING_NORMAL_THRESHOLD_MS = 250
const PING_DEGRADED_THRESHOLD_MS = 500

const DEGRADED_BLOCK_HEIGHT_DIFF = 50

export const useElapsedTimeStatus = (timestamp: number | null) => {
  const { t } = useTranslation()
  const [now, setNow] = useState(Date.now())

  useInterval(() => {
    setNow(Date.now())
  }, 1000)

  const diff = timestamp === null ? Infinity : now - timestamp
  const status: ServiceStatus =
    diff < ELAPSED_TIME_ONLINE_THRESHOLD_MS
      ? "online"
      : diff < ELAPSED_TIME_DEGRADED_THRESHOLD_MS
        ? "degraded"
        : "offline"

  return {
    status,
    color: statusColorMap[status],
    text: t(`rpc.status.${status}`),
  }
}

export const usePingStatus = (ping: number | null) => {
  if (ping === null) {
    return {
      color: statusColorMap.offline,
    }
  }

  return {
    color:
      ping < PING_NORMAL_THRESHOLD_MS
        ? statusColorMap.online
        : ping < PING_DEGRADED_THRESHOLD_MS
          ? statusColorMap.degraded
          : statusColorMap.offline,
  }
}

export const useBlockHeightStatus = (blockHeight: number) => {
  const { t } = useTranslation()
  const { data: bestNumber } = useBestNumber()
  const blockHeightDifference =
    isNumber(bestNumber?.parachainBlockNumber) && isNumber(blockHeight)
      ? bestNumber?.parachainBlockNumber - blockHeight
      : null

  const status: ServiceStatus =
    isNumber(blockHeightDifference) &&
    blockHeightDifference > DEGRADED_BLOCK_HEIGHT_DIFF
      ? "degraded"
      : "online"

  return {
    status,
    color: statusColorMap[status],
    text: t("rpc.status.blockHeightDiff", {
      value: blockHeightDifference,
    }),
    blockHeightDifference,
  }
}

export const useFullSquidUrlList = () => {
  const { t } = useTranslation()
  const { squidList } = useSquidListStore()
  return useMemo(() => {
    const list = [
      ...SQUID_URLS.map(({ name, url }) => ({
        name,
        url,
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
