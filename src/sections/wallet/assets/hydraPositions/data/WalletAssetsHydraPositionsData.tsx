import BN from "bignumber.js"
import { Trans } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { ResponsiveValue } from "utils/responsive"

type Props = {
  symbol: string
  lrna: BN
  value: BN
  fontSize?: ResponsiveValue<number>
}

export const WalletAssetsHydraPositionsData = ({
  symbol,
  value,
  lrna,
  fontSize = [14, 16],
}: Props) => {
  const tKey =
    !lrna.isNaN() && lrna.gt(0)
      ? "wallet.assets.hydraPositions.data.valueLrna"
      : "wallet.assets.hydraPositions.data.value"

  return (
    <Text
      fs={fontSize}
      lh={[16, 18]}
      fw={500}
      color="white"
      tAlign={["right", "left"]}
    >
      <Trans i18nKey={tKey} tOptions={{ value, symbol, lrna, type: "token" }}>
        <br sx={{ display: ["initial", "none"] }} />
      </Trans>
    </Text>
  )
}
