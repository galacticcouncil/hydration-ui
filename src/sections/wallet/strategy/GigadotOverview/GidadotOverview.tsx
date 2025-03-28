import InfoIcon from "assets/icons/LPInfoIcon.svg?react"
import { AssetTableName } from "components/AssetTableName/AssetTableName"
import { Separator } from "components/Separator/Separator"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { GigadotOverviewTile } from "sections/wallet/strategy/GigadotOverview/GigadotOverviewTile"
import { GIGADOT_ASSET_ID } from "sections/wallet/strategy/strategy.mock"

export type StrategyRiskLevel = "low" | "moderate" | "high"

type Props = {
  readonly riskLevel: StrategyRiskLevel
  readonly apr: number
  readonly tvl: string
}

export const GigadotOverview: FC<Props> = ({ riskLevel, apr, tvl }) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: "column", gap: [20, 30] }}>
      <div sx={{ display: ["initial", "none"] }}>
        <AssetTableName id={GIGADOT_ASSET_ID} />
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
          <AssetTableName id={GIGADOT_ASSET_ID} />
          <GigadotStrategyOverviewSeparator />
        </div>
        <GigadotOverviewTile
          variant={`risk:${riskLevel}`}
          label={`${t("risk")}:`}
          value={riskLevel}
          icon={<InfoIcon />}
        />
        <GigadotStrategyOverviewSeparator />
        <GigadotOverviewTile
          label={`${t("apr")}:`}
          value={t("value.APRshort", { apr })}
        />
        <GigadotStrategyOverviewSeparator />
        <GigadotOverviewTile
          label={`${t("tvlShort")}:`}
          value={t("value.usd", { amount: tvl })}
        />
      </div>
    </div>
  )
}

const GigadotStrategyOverviewSeparator: FC = () => {
  return <Separator orientation="vertical" sx={{ height: "100%" }} />
}
