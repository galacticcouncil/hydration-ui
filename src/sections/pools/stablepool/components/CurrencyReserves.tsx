import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import { SRow } from "./CurrencyReserves.styled"
import { useTranslation } from "react-i18next"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { TStablepool } from "sections/pools/PoolsPage.utils"
import BN from "bignumber.js"
import { DollarAssetValue } from "components/DollarAssetValue/DollarAssetValue"

type Props = {
  pool: TStablepool
}

export const CurrencyReserves = ({ pool }: Props) => {
  const { balances, tvlDisplay } = pool
  const { t } = useTranslation()

  return (
    <>
      <Text fs={16} font="GeistMono" tTransform="uppercase" sx={{ mb: 5 }}>
        {t("liquidity.stablepool.reserves")}
      </Text>
      {balances.map(({ id, symbol, percentage, balanceDisplay, balance }) => (
        <SRow key={id}>
          <div sx={{ flex: "row", align: "center", gap: 8 }}>
            <Icon size={24} icon={<AssetLogo id={id} />} />
            <Text color="white" fs={14}>
              {symbol}
            </Text>
          </div>
          <div sx={{ flex: "row", align: "flex-start", gap: 8 }}>
            <div sx={{ flex: "column", align: "flex-end" }}>
              <Text color="white" fs={14}>
                {t("value", {
                  value: balance,
                  decimalPlaces:
                    symbol?.includes("ETH") || symbol?.includes("BTC") ? 4 : 3,
                })}
              </Text>

              <DollarAssetValue
                value={BN(balanceDisplay)}
                wrapper={(children) => (
                  <Text fs={10} color="whiteish500">
                    {children}
                  </Text>
                )}
              >
                <DisplayValue value={BN(balanceDisplay)} />
              </DollarAssetValue>
            </div>

            <Text color="basic500" fs={14}>
              ({t("value.percentage", { value: percentage, decimalPlaces: 1 })})
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
          <DisplayValue value={tvlDisplay} />
        </Text>
      </div>
    </>
  )
}
