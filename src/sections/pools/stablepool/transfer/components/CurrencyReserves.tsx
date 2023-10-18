import { Heading } from "components/Typography/Heading/Heading"
import { Icon } from "components/Icon/Icon"
import { AssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import BigNumber from "bignumber.js"
import { BN_0, BN_100 } from "utils/constants"
import { useDisplayAssetStore } from "utils/displayAsset"
import { SRow } from "./CurrencyReserves.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { useTranslation } from "react-i18next"

type Props = {
  assets: Array<{
    id: string
    symbol?: string
    balance: BigNumber
    value: BigNumber
  }>
}

export const CurrencyReserves = ({ assets }: Props) => {
  const { t } = useTranslation()
  const totalValue = assets.reduce((t, asset) => t.plus(asset.value), BN_0)
  const displayAsset = useDisplayAssetStore()

  const rpcProvider = useRpcProvider()
  const asset = displayAsset.id
    ? rpcProvider.assets.getAsset(displayAsset.id)
    : undefined
  const { t } = useTranslation()

  return (
    <>
      <Heading color="white" fs={15} sx={{ mb: 5 }}>
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
              {t("value", { value: balance.dp(0) })}
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
          {t("liquidity.add.modal.row.transactionCostValue", {
            amount: totalValue,
            symbol: asset?.symbol,
            type: "dollar",
          })}
        </Text>
      </div>
    </>
  )
}
