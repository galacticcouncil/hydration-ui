import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { Trans } from "react-i18next"
import { theme } from "theme"
import { LrnaPositionTooltip } from "sections/pools/components/LrnaPositionTooltip"
import { useMedia } from "react-use"

type Props = {
  assetId: string
  symbol: string
  amount: BN
  lrna?: BN
  amountDisplay: BN
}

export const WalletAssetsHydraPositionsDetails = ({
  symbol,
  amount,
  lrna,
  amountDisplay,
  assetId,
}: Props) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const tKey = lrna?.gt(0)
    ? "wallet.assets.hydraPositions.data.valueLrna"
    : "wallet.assets.hydraPositions.data.value"

  return (
    <div sx={{ m: "auto", flex: "column" }}>
      <div sx={{ flex: "row", gap: 4 }}>
        <Text
          fs={16}
          lh={16}
          fw={500}
          color="white"
          css={{ whiteSpace: "nowrap" }}
        >
          <Trans
            i18nKey={tKey}
            tOptions={{ value: amount, symbol, lrna, type: "token" }}
          />
        </Text>
        {isDesktop && (
          <LrnaPositionTooltip
            lrnaPosition={lrna}
            tokenPosition={amount}
            assetId={assetId}
          />
        )}
      </div>
      <Text
        fs={13}
        lh={20}
        fw={500}
        css={{ color: `rgba(${theme.rgbColors.paleBlue}, 0.6)` }}
      >
        <DisplayValue value={amountDisplay} />
      </Text>
    </div>
  )
}
