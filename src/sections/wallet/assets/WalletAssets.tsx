import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { useAccountStore } from "state/store"
import { WalletAssetsHeader } from "./WalletAssetsHeader"
import { WalletAssetsTableWrapper } from "./table/WalletAssetsTableWrapper"
import { WalletAssetsPositionsWrapper } from "./hydraPositions/WalletAssetsPositionsWrapper"
import { Spacer } from "components/Spacer/Spacer"

export const WalletAssets = () => {
  const { account } = useAccountStore()

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
          <WalletAssetsPositionsWrapper />
        </>
      )}
    </div>
  )
}
