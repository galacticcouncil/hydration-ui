import { useTranslation } from "react-i18next"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { useExternalTokenMeta } from "sections/wallet/addToken/AddToken.utils"
import { useAssets } from "providers/assets"

export const AssetTableName = ({
  large,
  isPaymentFee,
  id,
}: {
  large?: boolean
  isPaymentFee?: boolean
  id: string
}) => {
  const { t } = useTranslation()
  const { getAsset } = useAssets()

  const asset = getAsset(id)
  const getExternalMeta = useExternalTokenMeta()
  const meta = asset?.isExternal ? getExternalMeta(id) ?? asset : asset

  if (!meta) return null

  return (
    <div sx={{ width: ["max-content", "inherit"] }}>
      <div
        sx={{ flex: "row", gap: 8, align: "center", width: "fit-content" }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <MultipleAssetLogo size={[large ? 28 : 26, 26]} iconId={meta.iconId} />

        <div sx={{ flex: "column", width: "100%", gap: [0, 2] }}>
          <Text
            fs={large ? 18 : 14}
            lh={large ? 16 : 14}
            font="GeistMedium"
            color="white"
          >
            {meta.symbol}
          </Text>
          <Text
            fs={large ? 14 : 12}
            lh={large ? 17 : 12}
            sx={{ display: !large ? ["none", "block"] : undefined }}
            color="whiteish500"
          >
            {meta.name}
          </Text>
        </div>
      </div>
      {isPaymentFee && (
        <Text
          fs={10}
          sx={{
            mt: 4,
            ml: large ? 30 : [32, 34],
          }}
          color="brightBlue300"
          tTransform="uppercase"
        >
          {t("wallet.assets.table.details.feePaymentAsset")}
        </Text>
      )}
    </div>
  )
}
