import { useTranslation } from "react-i18next"
import { AssetOverviewProps, AssetOverviewSeparator } from "./AssetOverview"
import { AssetOverviewLogo } from "./AssetOverviewLogo"
import { AssetOverviewTile } from "./AssetOverviewTile"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import BN from "bignumber.js"
import { THollarPool } from "sections/wallet/strategy/StrategyTile/HollarTile"
import { BN_0 } from "utils/constants"

export const HollarOverview = ({
  underlyingAssetId,
  riskLevel,
  riskTooltip,
  pools,
  isLoading,
}: AssetOverviewProps & { pools: THollarPool[]; isLoading: boolean }) => {
  const { t } = useTranslation()

  const apys = pools.map((pool) => pool.apy)

  const lowest = Math.min(...apys)
  const highest = Math.max(...apys)

  const tvlTotal = pools.reduce((acc, pool) => acc.plus(pool.tvl), BN_0)

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
