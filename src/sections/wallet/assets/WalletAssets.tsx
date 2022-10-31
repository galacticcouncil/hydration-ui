import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { WalletAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton"
import { WalletAssetsTable } from "sections/wallet/assets/table/WalletAssetsTable"

export const WalletAssets = () => {
  return (
    <div sx={{ mt: 56 }}>
      <WalletAssetsTablePlaceholder />
      <div sx={{ mt: 32 }} />
      <WalletAssetsTableSkeleton />
      <div sx={{ mt: 32 }} />
      <WalletAssetsTable />
    </div>
  )
}
