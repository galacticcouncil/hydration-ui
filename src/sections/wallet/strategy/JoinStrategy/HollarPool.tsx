import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import { THollarPoolWithAccountBalance } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { SHollarPool } from "./HollarPools.styled"
import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import BN from "bignumber.js"
import { SCircle } from "sections/assets/AssetsModalRow.styled"
import { useMedia } from "react-use"
import { theme } from "theme"

export const HollarPool = ({
  pool,
  index,
  selectedPool,
  setSelected,
}: {
  pool: THollarPoolWithAccountBalance
  index: number
  selectedPool: THollarPoolWithAccountBalance
  setSelected: (pool: THollarPoolWithAccountBalance) => void
}) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const isActive = selectedPool.stablepoolId === pool.stablepoolId

  return (
    <SHollarPool isActive={isActive} onClick={() => setSelected(pool)}>
      <div sx={{ flex: "row", gap: 12, align: "center" }}>
        <MultipleAssetLogo
          size={20}
          iconId={getAssetWithFallback(pool.stablepoolId).iconId}
        />

        <Text fs={13} color="white" font="GeistMedium">
          {pool.meta.symbol}
        </Text>

        <Separator orientation="vertical" sx={{ height: 15 }} />

        <Text fs={12} color="brightBlue300">
          {t("value.percentage", {
            value: BN(pool.apy),
            numberSuffix: "% APR",
          })}
        </Text>
      </div>

      <div sx={{ flex: "row", gap: [8, 36], align: "center" }}>
        {isDesktop && pool.highestBalance && (
          <Text fs={12} color="green500">
            {t("wallet.strategy.hollar.join.apy", {
              value: pool.highestBalance.balance,
              symbol: pool.highestBalance.symbol,
            })}
          </Text>
        )}

        <SCircle isActive={isActive} />
      </div>
    </SHollarPool>
  )
}
