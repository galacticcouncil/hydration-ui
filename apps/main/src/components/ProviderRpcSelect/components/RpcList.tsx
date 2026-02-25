import { Stack, VirtualizedList } from "@galacticcouncil/ui/components"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isFunction, prop, uniqueBy } from "remeda"

import { PROVIDER_LIST } from "@/api/provider"
import { useRpcsStatus } from "@/api/rpc"
import {
  RpcListHeader,
  RpcListItem,
} from "@/components/ProviderRpcSelect/components/RpcListItem"
import { unsubscribeAllTxs } from "@/modules/transactions/utils/subscriptions"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore, useRpcListStore } from "@/states/provider"

export type RpcListProps = {
  className?: string
}

export const RpcList: React.FC<RpcListProps> = ({ className }) => {
  const { t } = useTranslation()
  const { rpcList, removeRpc } = useRpcListStore()
  const { setRpcUrl, rpcUrl } = useProviderRpcUrlStore()
  const { ws } = useRpcProvider()

  const providerList = useMemo(() => {
    const list = [
      ...PROVIDER_LIST.map(({ name, url }) => ({
        name,
        url,
        isCustom: false,
      })),
      ...rpcList.map((rpc, index) => ({
        ...rpc,
        name:
          rpc.name ?? t("rpc.change.modal.name.label", { index: index + 1 }),
        isCustom: true,
      })),
    ]

    return uniqueBy(list, prop("url"))
  }, [rpcList, t])

  const providerListUrls = providerList.map(prop("url"))

  const rpcsStatusQueries = useRpcsStatus(providerListUrls, {
    calculateAvgPing: true,
  })

  const handleSwitchRpc = (url: string) => {
    if (isFunction(ws.switch)) {
      unsubscribeAllTxs()
      ws.switch(url)
    } else {
      setRpcUrl(url)
      window.location.reload()
    }
  }

  return (
    <Stack className={className}>
      <RpcListHeader />
      <VirtualizedList
        items={providerList}
        maxVisibleItems={5}
        itemSize={56}
        renderItem={(props, { index }) => {
          const rpcStatusQuery = rpcsStatusQueries[index]
          return (
            <RpcListItem
              {...props}
              {...rpcStatusQuery?.data}
              isLoading={!!rpcStatusQuery?.isLoading}
              isActive={rpcUrl === props.url}
              onClick={handleSwitchRpc}
              onRemove={removeRpc}
            />
          )
        }}
      />
    </Stack>
  )
}
