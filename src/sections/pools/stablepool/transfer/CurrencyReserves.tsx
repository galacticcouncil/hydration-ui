import { Heading } from "components/Typography/Heading/Heading"
import { Icon } from "components/Icon/Icon"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import BigNumber from "bignumber.js"
import { BN_0, BN_100 } from "utils/constants"
import { useDisplayAssetStore } from "utils/displayAsset"
import { useAssetMeta } from "api/assetMeta"
import { SRow } from "./CurrencyReserves.styled"

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
  const meta = useAssetMeta(displayAsset.id)

  return (
    <div sx={{ p: 30 }}>
      <Heading color="white" fs={15}>
        Currency reserves
      </Heading>
      {assets.map(({ id, symbol, balance, value }) => (
        <SRow key={id}>
          <div sx={{ flex: "row", align: "center", gap: 8 }}>
            <Icon size={24} icon={getAssetLogo(symbol)} />
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
          ≈ {totalValue.toNumber()} {meta.data?.symbol}
        </Text>
      </div>
    </div>
  )
}
