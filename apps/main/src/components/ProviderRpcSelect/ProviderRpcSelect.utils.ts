import { useMemo, useState } from "react"
import { useTranslation } from "react-i18next"
import { useInterval } from "react-use"
import { prop, uniqueBy } from "remeda"

import { SQUID_URLS } from "@/config/rpc"
import { useSquidListStore } from "@/states/provider"

const rpcStatusTextMap = {
  online: "rpc.status.online",
  slow: "rpc.status.slow",
  offline: "rpc.status.offline",
} as const

const statusColorMap = {
  online: "accents.success.emphasis",
  slow: "accents.alert.primary",
  offline: "accents.danger.emphasis",
} as const

export const useElapsedTimeStatus = (timestamp: number | null) => {
  const { t } = useTranslation()
  const [now, setNow] = useState(Date.now())

  useInterval(() => {
    setNow(Date.now())
  }, 1000)

  if (timestamp === null) {
    return {
      status: "offline",
      color: statusColorMap.offline,
      text: t(rpcStatusTextMap.offline),
    }
  }

  const diff = now - timestamp
  const status = diff < 32_000 ? "online" : diff < 120_000 ? "slow" : "offline"

  return {
    status,
    color: statusColorMap[status],
    text: t(rpcStatusTextMap[status]),
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
      ping < 250
        ? statusColorMap.online
        : ping < 500
          ? statusColorMap.slow
          : statusColorMap.offline,
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
