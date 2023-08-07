import { Heading } from "components/Typography/Heading/Heading"
import { Icon } from "components/Icon/Icon"
import { getAssetLogo } from "components/AssetIcon/AssetIcon"
import { Text } from "components/Typography/Text/Text"
import BigNumber from "bignumber.js"
import styled from "@emotion/styled"
import { theme } from "theme"
import { BN_0, BN_100 } from "utils/constants"

type Props = {
  assets: Array<{
    id: string
    symbol: string
    balance: BigNumber
    value: BigNumber
  }>
}

const SRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 15px 0;
  gap: 10px;
  border-bottom: 1px solid ${theme.colors.darkBlue400};
`

export const CurrencyReserves = ({ assets }: Props) => {
  const totalValue = assets.reduce((t, asset) => t.plus(asset.value), BN_0)

  return (
    <>
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
              ({value.div(totalValue).times(BN_100).dp(1).toNumber()}%)
            </Text>
          </div>
        </SRow>
      ))}
      <div
        sx={{ flex: "row", justify: "space-between", align: "center", mt: 19 }}
      >
        <Text color="basic400">Total:</Text>
        <Text color="white">≈ ${totalValue.toNumber()} USDT</Text>
      </div>
    </>
  )
}
