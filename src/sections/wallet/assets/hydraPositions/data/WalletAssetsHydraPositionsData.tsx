import BN from "bignumber.js"
import { Trans } from "react-i18next"
import { Text } from "components/Typography/Text/Text"

type Props = {
  symbol: string
  lrna: BN
  value: BN
}

export const WalletAssetsHydraPositionsData = ({
  symbol,
  value,
  lrna,
}: Props) => {
  const tKey =
    !lrna.isNaN() && lrna.gt(0)
      ? "wallet.assets.hydraPositions.data.valueLrna"
      : "wallet.assets.hydraPositions.data.value"

  return (
    <div sx={{ display: "flex", flexWrap: "wrap" }}>
      <Text
        fs={[14, 16]}
        lh={[16, 18]}
        fw={500}
        color="white"
        tAlign={["right", "left"]}
      >
        <Trans i18nKey={tKey} tOptions={{ value, symbol, lrna }}>
          <br sx={{ display: ["initial", "none"] }} />
        </Trans>
      </Text>
    </div>
  )
}
