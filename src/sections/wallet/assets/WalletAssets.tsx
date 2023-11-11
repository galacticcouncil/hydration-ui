import { Spacer } from "components/Spacer/Spacer"
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

const enabledBonds = import.meta.env.VITE_FF_BONDS_ENABLED === "true"

export const WalletAssets = () => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) {
    return (
      <div sx={{ mt: [34, 56] }}>
        <WalletAssetsHeader />
        <WalletAssetsTableSkeleton />
        <Spacer axis="vertical" size={20} />
        {enabledBonds && (
          <>
            <BondsTableSkeleton title={t("bonds.table.title")} />
            <Spacer axis="vertical" size={20} />
          </>
        )}

        <WalletAssetsHydraPositionsSkeleton />
        <Spacer axis="vertical" size={20} />
        <WalletFarmingPositionsSkeleton />
      </div>
    )
  }

  return (
    <div sx={{ mt: [34, 56] }}>
      {!account ? (
        <>
          <WalletAssetsHeader disconnected />
          <WalletAssetsTablePlaceholder />
        </>
      ) : (
        <>
          <WalletAssetsHeader />

          <WalletAssetsTableWrapper />

          <Spacer axis="vertical" size={20} />

          {enabledBonds && (
            <>
              <MyActiveBonds showTransfer />

              <Spacer axis="vertical" size={20} />
            </>
          )}

          <WalletAssetsPositionsWrapper />

          <Spacer axis="vertical" size={20} />

          <WalletFarmingPositionsWrapper />
        </>
      )}
    </div>
  )
}
