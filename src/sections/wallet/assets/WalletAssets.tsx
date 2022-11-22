import { useAssetsTableData } from "sections/wallet/assets/table/data/WalletAssetsTableData.utils"
import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { WalletAssetsTableSkeleton } from "sections/wallet/assets/table/skeleton/WalletAssetsTableSkeleton"
import { WalletAssetsTable } from "sections/wallet/assets/table/WalletAssetsTable"
import { useAccountStore } from "state/store"
import { WalletAssetsHeader } from "./WalletAssetsHeader"
import { WalletAssetsHydraPositions } from "sections/wallet/assets/hydraPositions/WalletAssetsHydraPositions"
import { useAssetsHydraPositionsData } from "sections/wallet/assets/hydraPositions/data/WalletAssetsHydraPositionsData.utils"
import { WalletAssetsHydraPositionsSkeleton } from "sections/wallet/assets/hydraPositions/skeleton/WalletAssetsHydraPositionsSkeleton"

export const WalletAssets = () => {
  const { account } = useAccountStore()
  const assetsTable = useAssetsTableData()
  const positionsTable = useAssetsHydraPositionsData()

  return (
    <div sx={{ mt: [34, 56] }}>
      {!account ? (
        <WalletAssetsTablePlaceholder />
      ) : (
        <>
          <WalletAssetsHeader
            isLoading={assetsTable.isLoading}
            data={assetsTable.data}
          />
          <div
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
            }}
          >
            {assetsTable.isLoading ? (
              <WalletAssetsTableSkeleton />
            ) : (
              <WalletAssetsTable data={assetsTable.data} />
            )}
            {positionsTable.isLoading ? (
              <WalletAssetsHydraPositionsSkeleton />
            ) : (
              <WalletAssetsHydraPositions data={positionsTable.data} />
            )}
          </div>
        </>
      )}
    </div>
  )
}
