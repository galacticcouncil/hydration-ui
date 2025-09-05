import { Text } from "components/Typography/Text/Text"
import { MultipleAssetLogo } from "components/AssetIcon/AssetIcon"
import { TAsset } from "providers/assets"
import { useAssetsPrice } from "state/displayPrice"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { useTranslation } from "react-i18next"
import { scaleHuman } from "utils/balance"

type Props = {
  meta: TAsset
  amount: string
  withDollarPrice?: boolean
}

export const RemoveLiquidityReward = ({
  meta,
  amount,
  withDollarPrice,
}: Props) => {
  const { t } = useTranslation()
  const { name, symbol, iconId, id, decimals } = meta

  const { getAssetPrice } = useAssetsPrice(withDollarPrice ? [id] : [])

  const assetPrice = getAssetPrice(id)

  const amountShifted = scaleHuman(amount, decimals)
  const amountDisplay =
    withDollarPrice && assetPrice
      ? amountShifted.times(assetPrice.price)
      : undefined

  return (
    <div sx={{ flex: "row", justify: "space-between", align: "center" }}>
      <div sx={{ flex: "row", align: "center", gap: 8 }}>
        <MultipleAssetLogo size={28} iconId={iconId} />

        <div sx={{ flex: "column" }}>
          <Text fs={[14, 16]}>{symbol}</Text>
          <Text fs={[10, 12]} color="neutralGray500">
            {name}
          </Text>
        </div>
      </div>

      <div sx={{ display: "flex", flexDirection: "column", align: "end" }}>
        <Text fs={[16, 18]} fw={[500, 700]}>
          {t("value.token", {
            value: amountShifted,
          })}
        </Text>

        {withDollarPrice && amountDisplay && (
          <DollarAssetValue
            value={amountDisplay}
            wrapper={(children) => (
              <Text color="basic400" fs={11}>
                {children}
              </Text>
            )}
          >
            <DisplayValue value={amountDisplay} />
          </DollarAssetValue>
        )}
      </div>
    </div>
  )
}
