import BN from "bignumber.js"
import { Trans, useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { theme } from "theme"

type Props = {
  symbol: string
  lrna: BN
  value: BN
  valueUSD: BN
}

export const WalletAssetsHydraPositionsData = ({
  symbol,
  value,
  valueUSD,
  lrna,
}: Props) => {
  const { t } = useTranslation()

  const tKey =
    !lrna.isNaN() && lrna.gt(0)
      ? "wallet.assets.hydraPositions.data.valueLrna"
      : "wallet.assets.hydraPositions.data.value"

  return (
    <div sx={{ flex: "column", align: ["end", "start"], gap: 2 }}>
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
      <Text
        fs={[12, 13]}
        lh={[14, 20]}
        fw={500}
        css={{ color: `rgba(${theme.rgbColors.whiteish500}, 0.61)` }}
      >
        {t("value.usd", { amount: valueUSD })}
      </Text>
    </div>
  )
}
