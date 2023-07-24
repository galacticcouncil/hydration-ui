import { Text } from "components/Typography/Text/Text"
import { SInfoIcon } from "sections/pools/pool/Pool.styled"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { useTranslation } from "react-i18next"
import { useSpotPrice } from "api/spotPrice"
import { useApiIds } from "api/consts"
import BigNumber from "bignumber.js"
import { BN_0, BN_1 } from "utils/constants"
import { useAssetMeta } from "api/assetMeta"
import { u32 } from "@polkadot/types"

type Props = {
  assetId?: string | u32
  lrnaPosition?: BigNumber
  tokenPosition?: BigNumber
}

export const TokenPositionInfo = ({
  assetId,
  tokenPosition,
  lrnaPosition,
}: Props) => {
  const { t } = useTranslation()
  const apiIds = useApiIds()
  const meta = useAssetMeta(assetId)

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
          {t("pools.tokenPositionInfo.tooltip")}
          <br />
          {t("value.tokenWithSymbol", {
            value: lrnaPositionPrice.plus(tokenPosition ?? BN_0),
            symbol: meta.data?.symbol,
          })}
        </Text>
      }
    >
      <SInfoIcon />
    </InfoTooltip>
  )
}
