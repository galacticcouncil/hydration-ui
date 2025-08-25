import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAssets } from "providers/assets"
import { useTranslation } from "react-i18next"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { SHollarPool } from "./HollarPools.styled"
import { Text } from "components/Typography/Text/Text"
import { Separator } from "components/Separator/Separator"
import BN from "bignumber.js"
import { Badge } from "components/Badge/Badge"
import { SCircle } from "sections/assets/AssetsModalRow.styled"

export const HollarPool = ({
  pool,
  index,
  selectedPool,
  setSelected,
}: {
  pool: THollarPool
  index: number
  selectedPool: THollarPool
  setSelected: (pool: THollarPool) => void
}) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const isActive = selectedPool.stablepoolId === pool.stablepoolId

  return (
    <SHollarPool isActive={isActive} onClick={() => setSelected(pool)}>
      <div sx={{ flex: "row", gap: 12, align: "center" }}>
        <MultipleAssetLogo
          size={20}
          iconId={getAssetWithFallback(pool.stablepoolId).iconId}
        />

        <div sx={{ flex: "column" }}>
          <Text fs={13} color="white" font="GeistMedium">
            {pool.meta.symbol}
          </Text>
          <Text fs={11} color="alpha0">
            {getAssetWithFallback(pool.stablepoolId).symbol}
          </Text>
        </div>

        <Separator orientation="vertical" sx={{ height: 15 }} />

        <Text fs={12} color="brightBlue300">
          {t("value.percentage", {
            value: BN(pool.apy),
            numberSuffix: "% APR",
          })}
        </Text>
      </div>

      <div sx={{ flex: "row", gap: 36, align: "center" }}>
        {index === 0 && (
          <Badge variant="green" rounded={false}>
            {t("recommended")}
          </Badge>
        )}

        <SCircle isActive={isActive} />
      </div>
    </SHollarPool>
  )
}
