import { WalletAssetsTable } from "sections/wallet/assets/table/WalletAssetsTable"
import { useAssetsTableData } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { useAccountStore } from "state/store"
import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { WalletAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton"

export const WalletAssets = () => {
  const { account } = useAccountStore()
  const { data, isLoading } = useAssetsTableData()

  return (
    <div sx={{ mt: 56 }}>
      {!account ? (
        <WalletAssetsTablePlaceholder />
      ) : isLoading ? (
        <WalletAssetsTableSkeleton />
      ) : (
        data && <WalletAssetsTable data={data} />
      )}
    </div>
  )
}
