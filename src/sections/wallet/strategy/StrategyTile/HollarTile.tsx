import { StrategyTileBackgroundEffect } from "sections/wallet/strategy/StrategyTileBackgroundEffect/StrategyTileBackgroundEffect"
import {
  SStrategyTile,
  StrategyTileSeparator,
  StrategyTileVariant,
} from "./StrategyTile.styled"
import { HollarOverview } from "sections/wallet/strategy/AssetOverview/HollarOverview"
import { Separator } from "components/Separator/Separator"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { CurrentHollarDeposit } from "sections/wallet/strategy/CurrentDeposit/CurrentHollarDeposit"
import { CurrentDepositEmptyState } from "sections/wallet/strategy/CurrentDeposit/CurrentDepositEmptyState"
import { TErc20 } from "providers/assets"
import { JoinStrategy } from "sections/wallet/strategy/JoinStrategy/JoinStrategy"
import { useHollarPools } from "sections/wallet/strategy/WalletStrategy.utils"
import { useTranslation } from "react-i18next"
import { HOLLAR_ID } from "utils/constants"

export type THollarPool = {
  userShiftedBalance: string
  meta: TErc20
  apy: number
  tvl: string
  stablepoolId: string
  reserveBalances: {
    id: string
    balance: string
  }[]
}

export const HollarTile = () => {
  const { account } = useAccount()
  const { t } = useTranslation()
  const { data: pools, isLoading } = useHollarPools()

  return (
    <SStrategyTile variant={StrategyTileVariant.Hollar}>
      <StrategyTileBackgroundEffect variant={StrategyTileVariant.Hollar} />
      <div sx={{ flex: "column", gap: [20, 20, 35] }}>
        <HollarOverview
          assetId={HOLLAR_ID}
          underlyingAssetId={HOLLAR_ID}
          riskLevel="low"
          riskTooltip={t("wallet.strategy.gigadot.risk.tooltip")}
          pools={pools}
          isLoading={isLoading}
        />
        <Separator color="white" sx={{ opacity: 0.06 }} />
        {account && pools.length ? (
          <CurrentHollarDeposit pools={pools} />
        ) : (
          <CurrentDepositEmptyState
            emptyState={t("wallet.strategy.hollar.emptyState")}
          />
        )}
      </div>

      <StrategyTileSeparator />
      <JoinStrategy pools={pools} />
    </SStrategyTile>
  )
}
