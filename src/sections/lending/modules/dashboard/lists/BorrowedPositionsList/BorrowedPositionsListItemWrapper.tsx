import { AssetCapsProvider } from "sections/lending/hooks/useAssetCaps"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"
import { DashboardReserve } from "sections/lending/utils/dashboardSortUtils"

import { BorrowedPositionsListItem } from "./BorrowedPositionsListItem"
import { GhoBorrowedPositionsListItem } from "./GhoBorrowedPositionsListItem"

export const BorrowedPositionsListItemWrapper = ({
  item,
}: {
  item: DashboardReserve
}) => {
  const [displayGho] = useRootStore((store) => [store.displayGho])
  const { currentMarket } = useProtocolDataContext()

  return (
    <AssetCapsProvider asset={item.reserve}>
      {displayGho({ symbol: item.reserve.symbol, currentMarket }) ? (
        <GhoBorrowedPositionsListItem {...item} />
      ) : (
        <BorrowedPositionsListItem item={item} />
      )}
    </AssetCapsProvider>
  )
}
