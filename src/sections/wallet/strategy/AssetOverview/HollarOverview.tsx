import { useTranslation } from "react-i18next"
import { AssetOverviewProps, AssetOverviewSeparator } from "./AssetOverview"
import { AssetOverviewLogo } from "./AssetOverviewLogo"
import { AssetOverviewTile } from "./AssetOverviewTile"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import BN from "bignumber.js"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { BN_0 } from "utils/constants"
import { Text } from "components/Typography/Text/Text"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { useAssets } from "providers/assets"

export const HollarOverview = ({
  underlyingAssetId,
  riskLevel,
  riskTooltip,
  pools,
  isLoading,
}: AssetOverviewProps & { pools: THollarPool[]; isLoading: boolean }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const apys = pools.map((pool) => pool.apy)

  const lowest = Math.min(...apys)
  const highest = Math.max(...apys)

  const tvlTotal = pools.reduce((acc, pool) => acc.plus(pool.tvl), BN_0)

  const Tooltip = pools
    .sort((a, b) => b.apy - a.apy)
    .map((pool) => (
      <div
        key={pool.stablepoolId}
        sx={{ flex: "row", gap: 8, align: "center", py: 1 }}
      >
        <MultipleAssetLogo
          size={12}
          iconId={getAssetWithFallback(pool.stablepoolId).iconId}
        />
        <Text fs={14} font="GeistMono">
          {pool.meta.symbol}
        </Text>
        <Text fs={14} color="brightBlue100">
          {t("value.APR", { apr: pool.apy })}
        </Text>
      </div>
    ))

  return (
    <div sx={{ flex: "column", gap: [20, 30] }}>
      <AssetOverviewLogo
        assetId={underlyingAssetId}
        sx={{ display: ["flex", "none"] }}
      />
      <div
        sx={{
          flex: "row",
          align: "center",
          justify: "space-between",
          height: [43, 74],
        }}
      >
        <div sx={{ display: ["none", "contents"] }}>
          <AssetOverviewLogo assetId={underlyingAssetId} />
          <AssetOverviewSeparator />
        </div>
        <AssetOverviewTile
          variant={`risk:${riskLevel}`}
          label={`${t("risk")}:`}
          value={riskLevel}
          icon={<InfoTooltip text={riskTooltip} />}
        />
        <AssetOverviewSeparator />
        <AssetOverviewTile
          label={`${t("apy")}:`}
          value={t("value.percentage.range", {
            from: BN(lowest),
            to: BN(highest),
          })}
          isLoading={isLoading}
          icon={<InfoTooltip text={Tooltip} />}
        />
        <AssetOverviewSeparator />
        <AssetOverviewTile
          label={`${t("tvlShort")}:`}
          value={t("value.usd", { amount: tvlTotal })}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
