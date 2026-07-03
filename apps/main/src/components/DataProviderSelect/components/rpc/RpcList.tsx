import { Stack, VirtualizedList } from "@galacticcouncil/ui/components"
import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { isFunction, prop, uniqueBy } from "remeda"

import { PROVIDER_LIST } from "@/api/provider"
import { useRpcsStatus } from "@/api/rpc"
import {
  RpcListHeader,
  RpcListItem,
} from "@/components/DataProviderSelect/components/rpc/RpcListItem"
import { unsubscribeAllTxs } from "@/modules/transactions/utils/subscriptions"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useProviderRpcUrlStore, useRpcListStore } from "@/states/provider"

export type RpcListProps = {
  className?: string
  poll?: boolean
}

export const RpcList: React.FC<RpcListProps> = ({
  className,
  poll = false,
}) => {
  const { t } = useTranslation()
  const { rpcList, removeRpc } = useRpcListStore()
  const { rpcUrl, rpcUrlList, connectedRpcUrl } = useProviderRpcUrlStore()
  const { papiClient } = useRpcProvider()

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

    const urlOrder = new Map(rpcUrlList.map((url, index) => [url, index]))

    return uniqueBy(list, prop("url")).sort((a, b) => {
      const aIndex = urlOrder.get(a.url) ?? Number.MAX_SAFE_INTEGER
      const bIndex = urlOrder.get(b.url) ?? Number.MAX_SAFE_INTEGER
      return aIndex - bIndex
    })
  }, [rpcList, rpcUrlList, t])

  const providerListUrls = providerList.map(prop("url"))

  const rpcsStatusQueries = useRpcsStatus(providerListUrls, {
    calculateAvgPing: true,
    poll,
  })

  const handleSwitchRpc = (url: string) => {
    if (url === rpcUrl) return

    useProviderRpcUrlStore.setState({ rpcUrl: url, isRpcConnecting: true })

    if (isFunction(papiClient.switch)) {
      unsubscribeAllTxs()
      papiClient.switch(url)
    } else {
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
          const isQueryLoading = !!rpcStatusQuery?.isLoading
          const isConnecting =
            rpcUrl === props.url && rpcUrl !== connectedRpcUrl
          return (
            <RpcListItem
              {...props}
              {...rpcStatusQuery?.data}
              isLoading={isConnecting || isQueryLoading}
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
