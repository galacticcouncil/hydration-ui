import { Spacer } from "components/Spacer/Spacer"
import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { useAccountStore } from "state/store"
import { WalletFarmingPositionsWrapper } from "./farmingPositions/wrapper/WalletFarmingPositionsWrapper"
import { WalletAssetsPositionsWrapper } from "./hydraPositions/WalletAssetsPositionsWrapper"
import { WalletAssetsTableWrapper } from "./table/WalletAssetsTableWrapper"
import { WalletAssetsHeader } from "./header/WalletAssetsHeader"
import { useApiPromise } from "utils/api"
import { WalletAssetsTableSkeleton } from "./table/skeleton/WalletAssetsTableSkeleton"
import { WalletAssetsHydraPositionsSkeleton } from "./hydraPositions/skeleton/WalletAssetsHydraPositionsSkeleton"
import { WalletFarmingPositionsSkeleton } from "./farmingPositions/skeleton/WalletFarmingPositionsSkeleton"
import { isApiLoaded } from "utils/helpers"
import { MyActiveBonds } from "sections/trade/sections/bonds/MyActiveBonds"
import { Skeleton as BondsTableSkeleton } from "sections/trade/sections/bonds/table/skeleton/Skeleton"
import { useTranslation } from "react-i18next"

const enabledFarms = import.meta.env.VITE_FF_FARMS_ENABLED === "true"

export const WalletAssets = () => {
  const { t } = useTranslation()
  const { account } = useAccountStore()
  const api = useApiPromise()

  if (!isApiLoaded(api)) {
    return (
      <div sx={{ mt: [34, 56] }}>
        <WalletAssetsHeader />
        <WalletAssetsTableSkeleton />
        <Spacer axis="vertical" size={20} />
        <BondsTableSkeleton title={t("bonds.table.title")} />
        <Spacer axis="vertical" size={20} />
        <WalletAssetsHydraPositionsSkeleton />
        <Spacer axis="vertical" size={20} />
        {enabledFarms && <WalletFarmingPositionsSkeleton />}
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

          <MyActiveBonds showTransfer={true} />

          <Spacer axis="vertical" size={20} />

          <WalletAssetsPositionsWrapper />

          <Spacer axis="vertical" size={20} />

          {enabledFarms && <WalletFarmingPositionsWrapper />}
        </>
      )}
    </div>
  )
}
