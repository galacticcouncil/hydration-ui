import { useState } from "react"
import { WalletAssetsTable } from "./WalletAssetsTable"
import { useAssetsTableData } from "./data/WalletAssetsTableData.utils"
import { WalletAssetsTableSkeleton } from "./skeleton/WalletAssetsTableSkeleton"

export const WalletAssetsTableWrapper = () => {
  const [showAll, setShowAll] = useState(false)

  const assetsTable = useAssetsTableData(showAll)

  if (assetsTable.isLoading) return <WalletAssetsTableSkeleton />

  return (
    <WalletAssetsTable
      data={assetsTable.data}
      showAll={showAll}
      setShowAll={setShowAll}
    />
  )
}
