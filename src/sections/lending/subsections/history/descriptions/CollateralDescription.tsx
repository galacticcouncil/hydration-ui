import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Icon } from "components/Icon/Icon"
import { Text } from "components/Typography/Text/Text"
import { useAssets } from "providers/assets"
import { FC } from "react"
import { Trans, useTranslation } from "react-i18next"

type Props = {
  readonly assetId: string | null
  readonly enabled: boolean
}

export const CollateralDescription: FC<Props> = ({ assetId, enabled }) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()
  const asset = assetId ? getAsset(assetId) : null

  return (
    <Text
      fs={14}
      sx={{
        color: "white",
        flex: "row",
        gap: 4,
        align: "center",
        justify: ["end", "start"],
        flexWrap: "wrap",
      }}
    >
      <Trans
        t={t}
        i18nKey="lending.history.table.collateralization"
        values={{ state: enabled ? "Enabled" : "Disabled" }}
      >
        <span sx={{ color: enabled ? "green500" : "red500" }} />
      </Trans>
      <div sx={{ flex: "row", align: "center", gap: 4 }}>
        <Icon
          icon={<AssetLogo id={assetId ?? undefined} />}
          size={16}
          sx={{ mx: 2 }}
        />{" "}
        {asset?.symbol}
      </div>
    </Text>
  )
}
