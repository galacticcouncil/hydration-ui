import { Stack } from "@galacticcouncil/ui/components"

import { TBond } from "@/api/assets"
import { Page404 } from "@/components/Page404"
import { AppSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { StableBondsAbout } from "@/modules/strategies/stable-bonds/components/StableBondsAbout"
import { StableBondsAssetHeader } from "@/modules/strategies/stable-bonds/components/StableBondsAssetHeader"
import { StableBondsDeposit } from "@/modules/strategies/stable-bonds/components/StableBondsDeposit"
import { StableBondsDetails } from "@/modules/strategies/stable-bonds/components/StableBondsDetails"
import { StableBondsPastSales } from "@/modules/strategies/stable-bonds/components/StableBondsPastSales"
import { StableBondsPosition } from "@/modules/strategies/stable-bonds/components/StableBondsPosition"
import { StableBondsRollover } from "@/modules/strategies/stable-bonds/components/StableBondsRollover"
import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"
import {
  StableBondsConfigProvider,
  useStableBondsConfig,
} from "@/modules/strategies/stable-bonds/context/StableBondsConfigContext"
import { useStableBonds } from "@/modules/strategies/stable-bonds/hooks/useStableBonds"
import {
  isStableBondSoldOut,
  useStableBondsOtcOrders,
} from "@/modules/strategies/stable-bonds/hooks/useStableBondsOtcOrders"
import { useAssets } from "@/providers/assetsProvider"

type StableBondsPageProps = {
  asset: TBond
  isDetail?: boolean
}

const StableBondsPageContent: React.FC<StableBondsPageProps> = ({
  asset,
  isDetail,
}) => {
  const config = useStableBondsConfig()
  const { data: orders, isReady } = useStableBondsOtcOrders(
    config.bondId,
    config.otcAcceptedAssetIds,
    config.otcOfferIds,
  )
  const isSoldOut = isStableBondSoldOut(orders, isReady)
  const { past } = useStableBonds()
  const pastSales = past.filter((bond) => bond.id !== asset.id)

  return (
    <Stack gap="xxl">
      <StableBondsAssetHeader asset={asset} useAssetName={isDetail} />
      <TwoColumnGrid template="sidebar">
        <Stack gap="xl" sx={{ order: [2, null, 0], minWidth: 0 }}>
          <StableBondsPosition bondIds={isDetail ? [asset.id] : undefined} />
          <StableBondsDetails orders={orders} isSoldOut={isSoldOut} />
          <StableBondsAbout isSoldOut={isSoldOut} />
          {pastSales.length > 0 && <StableBondsPastSales bonds={pastSales} />}
        </Stack>
        <Stack gap="xl">
          <StableBondsRollover />
          {isReady ? <StableBondsDeposit orders={orders} /> : <AppSkeleton />}
        </Stack>
      </TwoColumnGrid>
    </Stack>
  )
}

type StableBondsPage = {
  bondId: string
  isDetail?: boolean
}

export const StableBondsPage: React.FC<StableBondsPage> = ({
  bondId,
  isDetail,
}) => {
  const { getBond } = useAssets()
  const asset = getBond(bondId)
  const config = STABLE_BONDS[bondId]

  if (!asset || !config) return <Page404 />

  return (
    <StableBondsConfigProvider config={config}>
      <StableBondsPageContent asset={asset} isDetail={isDetail} />
    </StableBondsConfigProvider>
  )
}
