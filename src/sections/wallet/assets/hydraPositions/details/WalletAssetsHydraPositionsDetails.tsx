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

type PairAsset = { amount: BN; symbol: string }

type Props = {
  assetId: string
  amount?: BN
  amountPair?: PairAsset[]
  lrna?: BN
  amountDisplay?: BN
}

export const WalletAssetsHydraPositionsDetails = ({
  amount,
  lrna,
  amountDisplay,
  amountPair,
  assetId,
}: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const meta = assets.getAsset(assetId.toString())

  return (
    <div sx={{ flex: "column", align: ["end", "start"] }}>
      {amountPair ? (
        <div sx={{ flex: "row", gap: 4 }}>
          <Text fs={14} lh={14} fw={500} color="white">
            {amountPair
              .map((balance) =>
                t("value.tokenWithSymbol", {
                  value: balance.amount,
                  symbol: balance.symbol,
                }),
              )
              .join(" | ")}
          </Text>
        </div>
      ) : lrna && !lrna.isZero() ? (
        <LrnaValue amount={amount} lrna={lrna} assetId={assetId} />
      ) : (
        <Text fs={14} lh={14} fw={500} color="white">
          {t("value.tokenWithSymbol", {
            value: amount,
            symbol: meta?.symbol,
          })}
        </Text>
      )}
      {amountDisplay && (
        <Text
          fs={13}
          lh={20}
          fw={500}
          css={{ color: `rgba(${theme.rgbColors.paleBlue}, 0.6)` }}
        >
          <DisplayValue value={amountDisplay} />
        </Text>
      )}
    </div>
  )
}

const LrnaValue = ({
  assetId,
  lrna,
  amount,
}: {
  assetId: string
  lrna: BN
  amount?: BN
}) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { t } = useTranslation()
  const { assets } = useRpcProvider()

  const meta = assetId ? assets.getAsset(assetId.toString()) : undefined
  const lrnaSpotPrice = useSpotPrice(assets.getAsset("1").id, assetId)

  const lrnaPositionPrice =
    lrna?.multipliedBy(lrnaSpotPrice.data?.spotPrice ?? BN_1) ?? BN_0
  return (
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
  )
}
