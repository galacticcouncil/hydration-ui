import { useBorrowAssetsApy } from "api/borrow"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Separator } from "components/Separator/Separator"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { AssetOverviewLogo } from "sections/wallet/strategy/AssetOverview/AssetOverviewLogo"
import {
  AssetOverviewTile,
  AssetOverviewTileValue,
} from "sections/wallet/strategy/AssetOverview/AssetOverviewTile"
import { StrategyRiskLevel } from "sections/wallet/strategy/StrategyTile/StrategyTile.data"
import { OverrideApy } from "sections/pools/stablepool/components/GigaIncentives"

export type AssetOverviewProps = {
  readonly assetId: string
  readonly underlyingAssetId: string
  readonly riskLevel: StrategyRiskLevel
  readonly riskTooltip: string
}

export const AssetOverview: FC<AssetOverviewProps> = ({
  assetId,
  underlyingAssetId,
  riskLevel,
  riskTooltip,
}) => {
  const { t } = useTranslation()
  const { data } = useBorrowAssetsApy([assetId])

  const { totalSupplyApy, tvl } = data[0] || {}

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
          customValue={
            <OverrideApy assetId={assetId} type="supply" withFarms size={16}>
              <AssetOverviewTileValue>
                {totalSupplyApy === Infinity
                  ? "∞"
                  : t("value.APRshort", { apr: totalSupplyApy })}
              </AssetOverviewTileValue>
            </OverrideApy>
          }
        />
        <AssetOverviewSeparator />
        <AssetOverviewTile
          label={`${t("tvlShort")}:`}
          value={t("value.usd", { amount: tvl })}
        />
      </div>
    </div>
  )
}

export const AssetOverviewSeparator: FC = () => (
  <Separator
    orientation="vertical"
    color="white"
    sx={{ height: "100%", opacity: 0.06 }}
  />
)
