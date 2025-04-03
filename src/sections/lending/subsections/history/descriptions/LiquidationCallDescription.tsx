import BigNumber from "bignumber.js"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { FC } from "react"
import { useTranslation } from "react-i18next"

type Props = {
  readonly assetId?: string | null
  readonly amount: string
}

export const LiquidationCallDescription: FC<Props> = ({ assetId, amount }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId ?? "")

  return (
    <Text
      fs={14}
      sx={{
        flex: "row",
        gap: 8,
        align: "center",
        justify: ["end", "start"],
        flexWrap: "wrap",
      }}
      css={{ whiteSpace: "collapse" }}
    >
      <span sx={{ textAlign: ["right", "left"] }}>
        {t("lending.history.table.liquidatedCollateral")}
      </span>
      <div sx={{ flex: "row", gap: 8, align: "center" }}>
        <Icon icon={<AssetLogo id={assetId ?? undefined} />} size={16} />
        {t("value.tokenWithSymbol", {
          value: new BigNumber(amount).shiftedBy(-asset.decimals).toString(),
          symbol: asset.symbol,
        })}
      </div>
    </Text>
  )
}
