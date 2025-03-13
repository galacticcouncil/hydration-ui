import { createLazyFileRoute } from "@tanstack/react-router"

import { WalletAssetsPage } from "@/modules/wallet/WalletAssetsPage"
import { WalletsPageSubpageLayoutActions } from "@/modules/wallet/WalletsPageSubpageLayoutActions"

export const Route = createLazyFileRoute("/_wallet/wallet/assets")({
  component: () => (
    <>
      <WalletsPageSubpageLayoutActions />
      <WalletAssetsPage />
    </>
  ),
})
