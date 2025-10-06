import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { WalletFarmingPositionsWrapper } from "./farmingPositions/wrapper/WalletFarmingPositionsWrapper"
import { WalletAssetsPositionsWrapper } from "./hydraPositions/WalletAssetsPositionsWrapper"
import {
  WalletAssetsHeader,
  WalletAssetsHeaderSkeleton,
} from "./header/WalletAssetsHeader"
import { WalletAssetsFilters } from "sections/wallet/assets/filter/WalletAssetsFilters"
import {
  AssetCategory,
  useWalletAssetsFilters,
} from "sections/wallet/assets/WalletAssets.utils"
import { AllAssets, Assets } from "./WalletSections"
import { WalletWormholeRedeemTable } from "sections/wallet/assets/wormhole/WalletWormholeRedeemTable"
import { HollarBanner } from "sections/lending/ui/hollar/hollar-banner/HollarBanner"

const sections: Record<AssetCategory, React.ReactNode> = {
  all: <AllAssets />,
  assets: <Assets />,
  liquidity: <WalletAssetsPositionsWrapper />,
  farming: <WalletFarmingPositionsWrapper />,
}

export const WalletAssets = () => {
  const { account } = useAccount()

  const { category } = useWalletAssetsFilters()

  if (!account)
    return (
      <div sx={{ flex: "column", gap: [24, 40] }}>
        <WalletAssetsHeaderSkeleton />
        <WalletAssetsTablePlaceholder />
      </div>
    )

  return (
    <div sx={{ flex: "column", gap: [24, 40] }}>
      <WalletAssetsHeader />
      <HollarBanner />
      <WalletWormholeRedeemTable />
      <div sx={{ flex: "column", gap: [16, 20] }}>
        <WalletAssetsFilters />
        {sections[category]}
      </div>
    </div>
  )
}
