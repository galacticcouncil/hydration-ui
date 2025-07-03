import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { WalletFarmingPositionsWrapper } from "./farmingPositions/wrapper/WalletFarmingPositionsWrapper"
import { WalletAssetsPositionsWrapper } from "./hydraPositions/WalletAssetsPositionsWrapper"
import {
  WalletAssetsHeader,
  WalletAssetsHeaderSkeleton,
} from "./header/WalletAssetsHeader"
import { WalletAssetsTableSkeleton } from "./table/skeleton/WalletAssetsTableSkeleton"
import { WalletAssetsHydraPositionsSkeleton } from "./hydraPositions/skeleton/WalletAssetsHydraPositionsSkeleton"
import { WalletFarmingPositionsSkeleton } from "./farmingPositions/skeleton/WalletFarmingPositionsSkeleton"
import { useRpcProvider } from "providers/rpcProvider"
import { Skeleton as BondsTableSkeleton } from "sections/trade/sections/bonds/table/skeleton/Skeleton"
import { useTranslation } from "react-i18next"
import { WalletAssetsFilters } from "sections/wallet/assets/filter/WalletAssetsFilters"
import { useWalletAssetsFilters } from "sections/wallet/assets/WalletAssets.utils"
import { AllAssets, Assets } from "./WalletSections"
import { WalletStrategyBanner } from "sections/wallet/strategy/WalletStrategyBanner/WalletStrategyBanner"

export const WalletAssets = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { isLoaded } = useRpcProvider()

  const { category } = useWalletAssetsFilters()

  const isAssetsVisible = category === "assets"
  const isLiquidityVisible = category === "liquidity"
  const isFarmingVisible = category === "farming"

  if (!account)
    return (
      <div sx={{ flex: "column", gap: [24, 40] }}>
        <WalletAssetsHeaderSkeleton />
        <WalletAssetsTablePlaceholder />
      </div>
    )

  let section

  if (isAssetsVisible) {
    section = isLoaded ? (
      <Assets />
    ) : (
      <div sx={{ flex: "column", gap: [24, 40] }}>
        <WalletAssetsTableSkeleton />
        <BondsTableSkeleton title={t("bonds.table.title")} />
      </div>
    )
  } else if (isLiquidityVisible) {
    section = isLoaded ? (
      <WalletAssetsPositionsWrapper />
    ) : (
      <WalletAssetsHydraPositionsSkeleton />
    )
  } else if (isFarmingVisible) {
    section = isLoaded ? (
      <WalletFarmingPositionsWrapper />
    ) : (
      <WalletFarmingPositionsSkeleton />
    )
  } else {
    section = isLoaded ? (
      <AllAssets />
    ) : (
      <div sx={{ flex: "column", gap: [24, 40] }}>
        <WalletAssetsTableSkeleton />
        <BondsTableSkeleton title={t("bonds.table.title")} />
        <WalletAssetsHydraPositionsSkeleton />
        <WalletFarmingPositionsSkeleton />
      </div>
    )
  }

  return (
    <div sx={{ flex: "column", gap: [24, 40] }}>
      <WalletAssetsHeader />
      <WalletStrategyBanner />
      <div sx={{ flex: "column", gap: [16, 20] }}>
        <WalletAssetsFilters />
        {section}
      </div>
    </div>
  )
}
