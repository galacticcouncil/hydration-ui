import { WalletAssetsTablePlaceholder } from "sections/wallet/assets/table/placeholder/WalletAssetsTablePlaceholder"
import { useAccountStore } from "state/store"
import { WalletAssetsHeader } from "./WalletAssetsHeader"
import { WalletAssetsTableWrapper } from "./table/WalletAssetsTableWrapper"
import { WalletAssetsPositionsWrapper } from "./hydraPositions/WalletAssetsPositionsWrapper"

export const WalletAssets = () => {
  const { account } = useAccountStore()

  return (
    <div sx={{ mt: [34, 56] }}>
      {!account ? (
        <>
          <WalletAssetsHeader isLoading={true} disabledAnimation />
          <WalletAssetsTablePlaceholder />
        </>
      ) : (
        <>
          <WalletAssetsTableWrapper />
          <WalletAssetsPositionsWrapper />
        </>
      )}
    </div>
  )
}
