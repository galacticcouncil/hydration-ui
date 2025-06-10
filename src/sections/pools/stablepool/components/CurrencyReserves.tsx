import { Heading } from "components/Typography/Heading/Heading"
import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import BigNumber from "bignumber.js"
import { BN_0, BN_100 } from "utils/constants"
import { SRow } from "./CurrencyReserves.styled"
import { useTranslation } from "react-i18next"
import { useMemo } from "react"
import { useAssets } from "providers/assets"
import { useAssetsPrice } from "state/displayPrice"
import { DisplayValue } from "components/DisplayValue/DisplayValue"

type Props = {
  reserves: { asset_id: number; amount: string }[]
}

export const CurrencyReserves = ({ reserves }: Props) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()
  const assetIds = reserves.map((reserve) => reserve.asset_id.toString())
  const { getAssetPrice } = useAssetsPrice(assetIds)

  const assets = useMemo(
    () =>
      reserves.map((reserve) => {
        const id = reserve.asset_id.toString()
        const meta = getAssetWithFallback(id)
        const spotPrice = getAssetPrice(id).price
        const balance = BigNumber(reserve.amount).shiftedBy(-meta.decimals)

        return {
          id,
          symbol: meta.symbol,
          balance,
          value: balance.multipliedBy(spotPrice),
        }
      }),
    [reserves, getAssetWithFallback, getAssetPrice],
  )

  const totalValue = assets.reduce((t, asset) => t.plus(asset.value), BN_0)

  return (
    <>
      <Heading
        color="white"
        fs={15}
        sx={{ mb: 5 }}
        tTransform="uppercase"
        font="GeistMono"
      >
        {t("liquidity.stablepool.reserves")}
      </Heading>
      {assets.map(({ id, symbol, balance, value }) => (
        <SRow key={id}>
          <div sx={{ flex: "row", align: "center", gap: 8 }}>
            <Icon size={24} icon={<AssetLogo id={id} />} />
            <Text color="white" fs={14}>
              {symbol}
            </Text>
          </div>
          <div sx={{ flex: "row", align: "center", gap: 8 }}>
            <Text color="white" fs={14}>
              {t("value", {
                value: balance,
                decimalPlaces:
                  symbol?.includes("ETH") || symbol?.includes("BTC") ? 4 : 3,
              })}
            </Text>
            <Text color="basic500" fs={14}>
              (
              {totalValue.gt(BN_0)
                ? value.div(totalValue).times(BN_100).dp(1).toNumber()
                : 0}
              %)
            </Text>
          </div>
        </SRow>
      ))}
      <div
        sx={{ flex: "row", justify: "space-between", align: "center", mt: 14 }}
      >
        <Text color="basic400" fs={14}>
          {t("total")}:
        </Text>
        <Text color="white" fs={14}>
          <DisplayValue value={totalValue} />
        </Text>
      </div>
    </>
  )
}
