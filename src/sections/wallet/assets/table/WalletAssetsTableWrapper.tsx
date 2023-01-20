import { useState } from "react"
import { Spacer } from "components/Spacer/Spacer"
import { WalletAssetsHeader } from "../WalletAssetsHeader"
import { WalletAssetsTable } from "./WalletAssetsTable"
import { useAssetsTableData } from "./data/WalletAssetsTableData.utils"
import { WalletAssetsTableSkeleton } from "./skeleton/WalletAssetsTableSkeleton"

export const WalletAssetsTableWrapper = () => {
  const [showAll, setShowAll] = useState(false)

  const assetsTable = useAssetsTableData(showAll)

  return (
    <>
      <WalletAssetsHeader
        isLoading={assetsTable.isLoading}
        data={assetsTable.data}
      />
      {assetsTable.isLoading ? (
        <WalletAssetsTableSkeleton />
      ) : (
        <WalletAssetsTable
          data={assetsTable.data}
          showAll={showAll}
          setShowAll={setShowAll}
        />
      )}
      <Spacer axis="vertical" size={20} />
    </>
  )
}
