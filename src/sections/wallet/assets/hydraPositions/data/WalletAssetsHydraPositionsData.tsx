import BN from "bignumber.js"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { ResponsiveValue } from "utils/responsive"
import { useRpcProvider } from "providers/rpcProvider"
import { useApiIds } from "api/consts"
import { BN_0, BN_1 } from "utils/constants"
import { useSpotPrice } from "api/spotPrice"

type Props = {
  lrna: BN
  value: BN
  assetId: string
  fontSize?: ResponsiveValue<number>
}

export const WalletAssetsHydraPositionsData = ({
  assetId,
  value,
  lrna,
  fontSize = [14, 16],
}: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const apiIds = useApiIds()

  const meta = assetId ? assets.getAsset(assetId.toString()) : undefined

  const lrnaSpotPrice = useSpotPrice(apiIds.data?.hubId, assetId)

  const lrnaPositionPrice =
    lrna?.multipliedBy(lrnaSpotPrice.data?.spotPrice ?? BN_1) ?? BN_0

  return (
    <Text
      fs={fontSize}
      lh={[16, 18]}
      fw={500}
      color="white"
      tAlign={["right", "left"]}
    >
      {t("value.tokenWithSymbol", {
        value: lrnaPositionPrice.plus(value ?? BN_0),
        symbol: meta?.symbol,
      })}
    </Text>
  )
}
