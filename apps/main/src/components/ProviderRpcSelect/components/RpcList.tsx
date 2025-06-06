import { useMemo } from "react"
import { useTranslation } from "react-i18next"
import { prop, uniqueBy } from "remeda"

import { PROVIDER_LIST } from "@/api/provider"
import { useRpcsStatus } from "@/api/rpc"
import {
  RpcListHeader,
  RpcListItem,
} from "@/components/ProviderRpcSelect/components/RpcListItem"
import { useProviderRpcUrlStore, useRpcListStore } from "@/states/provider"

import { SRpcList } from "./RpcList.styled"

export type RpcListProps = {
  className?: string
}

export const RpcList: React.FC<RpcListProps> = ({ className }) => {
  const { t } = useTranslation()
  const { rpcList, removeRpc } = useRpcListStore()
  const { rpcUrl, setRpcUrl } = useProviderRpcUrlStore()

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

  return (
    <SRpcList className={className}>
      <RpcListHeader />
      {providerList.map((props, index) => {
        const rpcStatusQuery = rpcsStatusQueries[index]
        return (
          <RpcListItem
            key={props.url}
            {...props}
            {...rpcStatusQuery?.data}
            isLoading={!!rpcStatusQuery?.isLoading}
            isActive={rpcUrl === props.url}
            onClick={setRpcUrl}
            onRemove={removeRpc}
          />
        )
      })}
    </SRpcList>
  )
}
