import { Stack, VirtualizedList } from "@galacticcouncil/ui/components"

import {
  SquidIndexerListHeader,
  SquidIndexerListItem,
} from "@/components/DataProviderSelect/components/squid/SquidIndexerListItem"
import { useFullSquidUrlList } from "@/components/DataProviderSelect/DataProviderSelect.utils"
import { useProviderRpcUrlStore, useSquidListStore } from "@/states/provider"

export type SquidIndexerListProps = {
  className?: string
}

export const SquidIndexerList: React.FC<SquidIndexerListProps> = ({
  className,
}) => {
  const { removeSquid } = useSquidListStore()
  const { squidUrl, setSquidUrl } = useProviderRpcUrlStore()

  const urlList = useFullSquidUrlList()

  return (
    <Stack className={className}>
      <SquidIndexerListHeader />
      <VirtualizedList
        items={urlList}
        maxVisibleItems={5}
        itemSize={56}
        renderItem={(props) => (
          <SquidIndexerListItem
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
