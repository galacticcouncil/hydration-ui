import { useTranslation } from "react-i18next"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { MultipleIcons } from "components/MultipleIcons/MultipleIcons"
import { useRpcProvider } from "providers/rpcProvider"
import { Icon } from "components/Icon/Icon"

export const AssetTableName = ({
  large,
  symbol,
  name,
  isPaymentFee,
  id,
}: {
  symbol: string
  name: string
  large?: boolean
  isPaymentFee?: boolean
  id: string
}) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const asset = assets.getAsset(id)

  const iconIds =
    assets.isStableSwap(asset) || assets.isShareToken(asset)
      ? asset.assets
      : asset.id

  return (
    <div sx={{ width: ["max-content", "inherit"] }}>
      <div
        sx={{ flex: "row", gap: 8, align: "center", width: "fit-content" }}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        {typeof iconIds === "string" ? (
          <Icon
            size={[large ? 28 : 26, 26]}
            icon={<AssetLogo id={iconIds} />}
          />
        ) : (
          <MultipleIcons
            icons={iconIds.map((asset) => {
              const meta = assets.getAsset(asset)
              const isBond = assets.isBond(meta)
              return {
                icon: (
                  <Icon
                    size={[large ? 28 : 26, 26]}
                    icon={<AssetLogo id={isBond ? meta.assetId : asset} />}
                  />
                ),
              }
            })}
          />
        )}

        <div sx={{ flex: "column", width: "100%", gap: [0, 4] }}>
          <Text
            fs={large ? 18 : 14}
            lh={large ? 16 : 14}
            font="ChakraPetchSemiBold"
            color="white"
          >
            {symbol}
          </Text>
          <Text
            fs={large ? 14 : 13}
            lh={large ? 17 : 13}
            sx={{ display: !large ? ["none", "block"] : undefined }}
            color="whiteish500"
          >
            {name}
          </Text>
        </div>
      </div>
      {isPaymentFee && (
        <Text
          fs={10}
          sx={{
            mt: 4,
            ml: large ? 30 : [32, 36],
          }}
          font="ChakraPetchSemiBold"
          color="brightBlue300"
          tTransform="uppercase"
        >
          {t("wallet.assets.table.details.feePaymentAsset")}
        </Text>
      )}
    </div>
  )
}
