import { FC } from "react"
import { SWalletStrategy } from "sections/wallet/strategy/WalletStrategy.styled"
import {
  StrategyTileVariant,
  StrategyTileSeparator,
  SStrategyTile,
} from "sections/wallet/strategy/StrategyTile/StrategyTile.styled"
import Skeleton from "react-loading-skeleton"
import { AssetInputSkeleton } from "sections/trade/skeleton/SwapAppSkeleton"
import { Separator } from "components/Separator/Separator"
import { WalletStrategyTitle } from "sections/wallet/strategy/WalletStrategyTitle"

export const WalletStrategyFormSkeleton = () => (
  <div sx={{ flex: "column", justify: "space-between", gap: 20 }}>
    <Skeleton width="30%" height={20} />
    <AssetInputSkeleton />
    <Skeleton height={44} />
  </div>
)

export const WalletStrategySkeleton: FC = () => {
  return (
    <SWalletStrategy>
      <WalletStrategyTitle />
      <WalletStrategyTileSkeleton variant={StrategyTileVariant.Hollar} />
      <WalletStrategyTileSkeleton variant={StrategyTileVariant.One} />
      <WalletStrategyTileSkeleton variant={StrategyTileVariant.Two} />
    </SWalletStrategy>
  )
}

const WalletStrategyTileSkeleton: FC<{
  readonly variant: StrategyTileVariant
}> = ({ variant }) => {
  return (
    <SStrategyTile variant={variant} sx={{ height: [400, 300] }}>
      <div sx={{ flex: "column", justify: "space-between", gap: 20 }}>
        <div sx={{ flex: "row", gap: [20, 40], flexWrap: "wrap" }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} css={{ flex: 1 }}>
              <Skeleton width="100%" height={20} />
              <Skeleton width="50%" height={18} sx={{ mt: 4 }} />
            </div>
          ))}
        </div>
        <Separator color="white" sx={{ opacity: 0.06 }} />
        <div sx={{ pb: [0, 30] }}>
          <Skeleton width="100%" height={20} />
          <Skeleton width="70%" height={20} sx={{ mt: 4 }} />
        </div>
      </div>
      <StrategyTileSeparator />
      <WalletStrategyFormSkeleton />
    </SStrategyTile>
  )
}
