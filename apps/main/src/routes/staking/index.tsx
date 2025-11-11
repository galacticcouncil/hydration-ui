import { createFileRoute } from "@tanstack/react-router"

import { assetsDataQuery } from "@/api/assets"
import { providerQuery } from "@/api/provider"
import { StakingDashboard } from "@/modules/staking/StakingDashboard"
import { getRpcProviderUrls } from "@/providers/rpcProvider"
import { useAssetRegistryStore } from "@/states/assetRegistry"

export const Route = createFileRoute("/staking/")({
  component: StakingDashboard,
  // @TODO: add better pending component
  pendingComponent: () => <div>Loading...</div>,
  loader: async ({ context: { queryClient } }) => {
    const { assets } = useAssetRegistryStore.getState()
    if (assets.length > 0) return
    const data = await queryClient.ensureQueryData(
      providerQuery(getRpcProviderUrls()),
    )
    await queryClient.ensureQueryData(assetsDataQuery(data.sdk))
  },
})
