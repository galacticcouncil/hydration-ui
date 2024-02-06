import BN from "bignumber.js"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { theme } from "theme"
import { LrnaPositionTooltip } from "sections/pools/components/LrnaPositionTooltip"
import { useMedia } from "react-use"
import { useRpcProvider } from "providers/rpcProvider"
import { useSpotPrice } from "api/spotPrice"
import { BN_0, BN_1 } from "utils/constants"

type Props = {
  assetId: string
  amount: BN
  lrna?: BN
  amountDisplay: BN
}

export const WalletAssetsHydraPositionsDetails = ({
  amount,
  lrna,
  amountDisplay,
  assetId,
}: Props) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const meta = assetId ? assets.getAsset(assetId.toString()) : undefined

  const lrnaSpotPrice = useSpotPrice(assets.getAsset("1").id, assetId)

  const lrnaPositionPrice =
    lrna?.multipliedBy(lrnaSpotPrice.data?.spotPrice ?? BN_1) ?? BN_0

  return (
    <div sx={{ flex: "column", align: ["end", "start"] }}>
      <div sx={{ flex: "row", gap: 4 }}>
        <Text fs={14} lh={14} fw={500} color="white">
          {t("value.tokenWithSymbol", {
            value: lrnaPositionPrice.plus(amount ?? BN_0),
            symbol: meta?.symbol,
          })}
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
