import { useState } from "react"
import { WalletAssetsTable } from "./WalletAssetsTable"
import { useAssetsData } from "./data/WalletAssetsTableData.utils"
import { WalletAssetsTableSkeleton } from "./skeleton/WalletAssetsTableSkeleton"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"

export const WalletAssetsTableWrapper = () => {
  const [showAll, setShowAll] = useState(false)

  const { search } = useWalletAssetsFilters()

  const data = useAssetsData({ isAllAssets: showAll, search })

  if (data.isLoading) return <WalletAssetsTableSkeleton />

  return (
    <WalletAssetsTable
      data={data.data}
      showAll={showAll}
      setShowAll={setShowAll}
    />
  )
}
