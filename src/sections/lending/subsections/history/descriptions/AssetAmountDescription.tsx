import BigNumber from "bignumber.js"
import { useAssets } from "providers/assets"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { FC } from "react"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

type Props = {
  readonly assetId: string | null | undefined
  readonly amount: string
}

export const AssetAmountDescription: FC<Props> = ({ assetId, amount }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId ?? "")

  return (
    <div
      sx={{
        color: "white",
        flex: "row",
        gap: 8,
        align: "center",
        justify: ["end", "start"],
        flexWrap: "wrap",
      }}
    >
      <Icon icon={<AssetLogo id={assetId ?? undefined} />} size={16} />
      <Text fs={14} css={{ whiteSpace: "nowrap" }}>
        {t("value.tokenWithSymbol", {
          value: new BigNumber(amount).shiftedBy(-asset.decimals).toString(),
          symbol: asset.symbol,
        })}
      </Text>
    </div>
  )
}
