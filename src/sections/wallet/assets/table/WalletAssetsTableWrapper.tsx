import { useState } from "react"
import { WalletAssetsTable } from "./WalletAssetsTable"
import { useAssetsTableData } from "./data/WalletAssetsTableData.utils"
import { WalletAssetsTableSkeleton } from "./skeleton/WalletAssetsTableSkeleton"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"

export const WalletAssetsTableWrapper = () => {
  const [showAll, setShowAll] = useState(false)

  const { search } = useWalletAssetsFilters()

  const assetsTable = useAssetsTableData({ isAllAssets: showAll, search })

  if (assetsTable.isLoading) return <WalletAssetsTableSkeleton />

  return (
    <WalletAssetsTable
      data={assetsTable.data}
      showAll={showAll}
      setShowAll={setShowAll}
    />
  )
}
