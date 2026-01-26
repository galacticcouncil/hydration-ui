import { Stack, VirtualizedList } from "@galacticcouncil/ui/components"

import {
  SquidListHeader,
  SquidListItem,
} from "@/components/ProviderRpcSelect/components/SquidListItem"
import { useFullSquidUrlList } from "@/components/ProviderRpcSelect/ProviderRpcSelect.utils"
import { useProviderRpcUrlStore, useSquidListStore } from "@/states/provider"

export type SquidListProps = {
  className?: string
}

export const SquidList: React.FC<SquidListProps> = ({ className }) => {
  const { removeSquid } = useSquidListStore()
  const { squidUrl, setSquidUrl } = useProviderRpcUrlStore()

  const urlList = useFullSquidUrlList()

  return (
    <Stack className={className}>
      <SquidListHeader />
      <VirtualizedList
        items={urlList}
        maxVisibleItems={5}
        itemSize={56}
        renderItem={(props) => (
          <SquidListItem
            {...props}
            isActive={squidUrl === props.url}
            onClick={setSquidUrl}
            onRemove={props.isCustom ? removeSquid : undefined}
          />
        )}
      />
    </Stack>
  )
}
