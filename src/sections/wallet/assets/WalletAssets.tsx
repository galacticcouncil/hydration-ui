import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { WalletFarmingPositionsWrapper } from "./farmingPositions/wrapper/WalletFarmingPositionsWrapper"
import { WalletAssetsPositionsWrapper } from "./hydraPositions/WalletAssetsPositionsWrapper"
import { WalletAssetsTableWrapper } from "./table/WalletAssetsTableWrapper"
import { WalletAssetsHeader } from "./header/WalletAssetsHeader"
import { WalletAssetsTableSkeleton } from "./table/skeleton/WalletAssetsTableSkeleton"
import { WalletAssetsHydraPositionsSkeleton } from "./hydraPositions/skeleton/WalletAssetsHydraPositionsSkeleton"
import { WalletFarmingPositionsSkeleton } from "./farmingPositions/skeleton/WalletFarmingPositionsSkeleton"
import { useRpcProvider } from "providers/rpcProvider"
import { MyActiveBonds } from "sections/trade/sections/bonds/MyActiveBonds"
import { Skeleton as BondsTableSkeleton } from "sections/trade/sections/bonds/table/skeleton/Skeleton"
import { useTranslation } from "react-i18next"
import { WalletAssetsFilters } from "sections/wallet/assets/filter/WalletAssetsFilters"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"

const enabledBonds = import.meta.env.VITE_FF_BONDS_ENABLED === "true"

export const WalletAssets = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { isLoaded } = useRpcProvider()

  const { category, search } = useWalletAssetsFilters()

  const isAllVisible = category === "all"
  const isAssetsVisible = isAllVisible || category === "assets"
  const isLiquidityVisible = isAllVisible || category === "liquidity"
  const isFarmingVisible = isAllVisible || category === "farming"

  if (!isLoaded) {
    return (
      <div>
        <WalletAssetsHeader />
        <WalletAssetsFilters />

        <div sx={{ display: "grid", gap: [16, 30] }}>
          <WalletAssetsTableSkeleton />
          {enabledBonds && (
            <BondsTableSkeleton title={t("bonds.table.title")} />
          )}

          <WalletAssetsHydraPositionsSkeleton />
          <WalletFarmingPositionsSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div>
      {!account ? (
        <>
          <WalletAssetsHeader disconnected />
          <WalletAssetsTablePlaceholder />
        </>
      ) : (
        <>
          <WalletAssetsHeader />
          <WalletAssetsFilters />

          <div sx={{ display: "grid", gap: [16, 30] }}>
            {isAssetsVisible && (
              <>
                <WalletAssetsTableWrapper />
                {enabledBonds && <MyActiveBonds showTransfer search={search} />}
              </>
            )}

            {isLiquidityVisible && <WalletAssetsPositionsWrapper />}
            {isFarmingVisible && <WalletFarmingPositionsWrapper />}
          </div>
        </>
      )}
    </div>
  )
}
