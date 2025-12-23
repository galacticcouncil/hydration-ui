import { Stack, VirtualizedList } from "@galacticcouncil/ui/components"

import {
  SquidListHeader,
  SquidListItem,
} from "@/components/ProviderRpcSelect/components/SquidListItem"
import { SQUID_URLS } from "@/config/rpc"
import { useProviderRpcUrlStore } from "@/states/provider"

export type SquidListProps = {
  className?: string
}

export const SquidList: React.FC<SquidListProps> = ({ className }) => {
  const { squidUrl, setSquidUrl } = useProviderRpcUrlStore()

  return (
    <Stack className={className}>
      <SquidListHeader />
      <VirtualizedList
        items={SQUID_URLS}
        maxVisibleItems={5}
        itemSize={56}
        renderItem={(props) => {
          return (
            <SquidListItem
              {...props}
              isActive={squidUrl === props.url}
              onClick={setSquidUrl}
            />
          )
        }}
      />
    </Stack>
  )
}
