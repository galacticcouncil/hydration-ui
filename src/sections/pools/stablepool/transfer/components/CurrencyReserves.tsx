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
  const totalValue = assets.reduce((t, asset) => t.plus(asset.value), BN_0)
  const displayAsset = useDisplayAssetStore()

  const rpcProvider = useRpcProvider()
  const asset = displayAsset.id
    ? rpcProvider.assets.getAsset(displayAsset.id)
    : undefined
    const { t } = useTranslation();

  return (
    <div sx={{ p: 30 }}>
      <Heading color="white" fs={15}>
        {t("liquidity.stablepool.reserves")}
      </Heading>
      {assets.map(({ id, symbol, balance, value }) => (
        <SRow key={id}>
          <div sx={{ flex: "row", align: "center", gap: 8 }}>
            <Icon size={24} icon={<AssetLogo id={id} />} />
            <Text color="white">{symbol}</Text>
          </div>
          <div sx={{ flex: "row", align: "center", gap: 8 }}>
            <Text color="white">{balance.toNumber()}</Text>
            <Text color="basic500">
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
        sx={{ flex: "row", justify: "space-between", align: "center", mt: 19 }}
      >
        <Text color="basic400">Total:</Text>
        <Text color="white">
          ≈ {totalValue.toNumber()} {asset?.symbol}
        </Text>
      </div>
    </div>
  )
}
