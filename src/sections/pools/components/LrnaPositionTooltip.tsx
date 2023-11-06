import { Text } from "components/Typography/Text/Text"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { useTranslation } from "react-i18next"
import { useSpotPrice } from "api/spotPrice"
import { useApiIds } from "api/consts"
import BigNumber from "bignumber.js"
import { BN_0, BN_1 } from "utils/constants"
import { u32 } from "@polkadot/types"
import { useRpcProvider } from "providers/rpcProvider"

type Props = {
  assetId?: string | u32
  lrnaPosition?: BigNumber
  tokenPosition?: BigNumber
}

export const LrnaPositionTooltip = ({
  assetId,
  tokenPosition,
  lrnaPosition,
}: Props) => {
  const { t } = useTranslation()
  const { assets } = useRpcProvider()
  const apiIds = useApiIds()
  const meta = assetId ? assets.getAsset(assetId.toString()) : undefined

  const lrnaSpotPrice = useSpotPrice(apiIds.data?.hubId, assetId)

  const lrnaPositionPrice =
    lrnaPosition?.multipliedBy(lrnaSpotPrice.data?.spotPrice ?? BN_1) ?? BN_0

  if (lrnaPositionPrice.isZero()) {
    return null
  }

  return (
    <InfoTooltip
      text={
        <Text fs={11} fw={500}>
          {t("pools.lrnaPosition.tooltip")}
          <br />
          {t("value.tokenWithSymbol", {
            value: lrnaPositionPrice.plus(tokenPosition ?? BN_0),
            symbol: meta?.symbol,
          })}
        </Text>
      }
    >
      <SInfoIcon />
    </InfoTooltip>
  )
}
