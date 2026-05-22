import { Stack } from "@galacticcouncil/ui/components"

import { AssetHeader } from "@/components/AssetHeader"
import { Page404 } from "@/components/Page404"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { StableBondsAbout } from "@/modules/strategies/stable-bonds/components/StableBondsAbout"
import { StableBondsDeposit } from "@/modules/strategies/stable-bonds/components/StableBondsDeposit"
import { useStableBondsOtcOrders } from "@/modules/strategies/stable-bonds/components/StableBondsDeposit.utils"
import { StableBondsDetails } from "@/modules/strategies/stable-bonds/components/StableBondsDetails"
import { StableBondsPosition } from "@/modules/strategies/stable-bonds/components/StableBondsPosition"
import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import {
  StableBondsConfigProvider,
  useStableBondsConfig,
} from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useAccountBalance } from "@/states/account"

type StableBondsPageProps = {
  asset: TAsset
}

const StableBondsPageContent: React.FC<StableBondsPageProps> = ({ asset }) => {
  const config = useStableBondsConfig()
  const { data: orders } = useStableBondsOtcOrders(config.otcOfferIds)
  const balance = useAccountBalance(asset.id)

  return (
    <Stack gap="xxl">
      <AssetHeader asset={asset} />
      <TwoColumnGrid template="sidebar">
        <Stack gap="xl" sx={{ order: [2, null, 0] }}>
          {balance && balance.transferable > 0n && <StableBondsPosition />}
          <StableBondsDetails orders={orders} />
          <StableBondsAbout />
        </Stack>
        {orders && orders.length > 0 && <StableBondsDeposit orders={orders} />}
      </TwoColumnGrid>
    </Stack>
  )
}

type StableBondsPage = {
  bondId: string
}

export const StableBondsPage: React.FC<StableBondsPage> = ({ bondId }) => {
  const { getAsset } = useAssets()
  const asset = getAsset(bondId)
  const config = STABLE_BONDS[bondId]

  if (!asset || !config) return <Page404 />

  return (
    <StableBondsConfigProvider config={config}>
      <StableBondsPageContent asset={asset} />
    </StableBondsConfigProvider>
  )
}
