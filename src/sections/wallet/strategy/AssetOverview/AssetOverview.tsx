import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Separator } from "components/Separator/Separator"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { AssetOverviewLogo } from "sections/wallet/strategy/AssetOverview/AssetOverviewLogo"
import { AssetOverviewTile } from "sections/wallet/strategy/AssetOverview/AssetOverviewTile"
import { useAssetOverviewData } from "sections/wallet/strategy/StrategyTile/StrategyTile.data"

type Props = {
  readonly assetId: string
}

export const AssetOverview: FC<Props> = ({ assetId }) => {
  const { t } = useTranslation()
  const { riskLevel, apr, tvl } = useAssetOverviewData(assetId, "low")

  return (
    <div sx={{ flex: "column", gap: [20, 30] }}>
      <div sx={{ display: ["initial", "none"] }}>
        <AssetOverviewLogo assetId={assetId} />
      </div>
      <div
        sx={{
          flex: "row",
          align: "center",
          justify: "space-between",
          height: [43, 74],
        }}
      >
        <div sx={{ display: ["none", "contents"] }}>
          <AssetOverviewLogo assetId={assetId} />
          <AssetOverviewSeparator />
        </div>
        <AssetOverviewTile
          variant={`risk:${riskLevel}`}
          label={`${t("risk")}:`}
          value={riskLevel}
          icon={<InfoTooltip text={t("wallet.strategy.risk.tooltip")} />}
        />
        <AssetOverviewSeparator />
        <AssetOverviewTile
          label={`${t("apr")}:`}
          value={apr === Infinity ? "∞" : t("value.APRshort", { apr })}
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

const AssetOverviewSeparator: FC = () => {
  return (
    <Separator
      orientation="vertical"
      color="white"
      sx={{ height: "100%", opacity: 0.06 }}
    />
  )
}
