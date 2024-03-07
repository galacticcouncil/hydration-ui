import { Text } from "components/Typography/Text/Text"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Trans } from "react-i18next"
import BigNumber from "bignumber.js"
import { u32 } from "@polkadot/types"
import { useRpcProvider } from "providers/rpcProvider"
import { SInfoIcon } from "components/InfoTooltip/InfoTooltip.styled"

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
  const { assets } = useRpcProvider()

  const meta = assetId ? assets.getAsset(assetId.toString()) : undefined

  if (!tokenPosition) return null

  if (!lrnaPosition || lrnaPosition.isZero()) {
    return null
  }

  const tKey =
    lrnaPosition && !lrnaPosition.isNaN() && lrnaPosition.gt(0)
      ? "wallet.assets.hydraPositions.data.valueLrna"
      : "wallet.assets.hydraPositions.data.value"

  return (
    <InfoTooltip
      text={
        <Text fs={11} fw={500}>
          <Trans
            i18nKey={tKey}
            tOptions={{
              value: tokenPosition,
              symbol: meta?.symbol,
              lrna: lrnaPosition,
              type: "token",
            }}
          >
            <br sx={{ display: ["initial", "none"] }} />
          </Trans>
        </Text>
      }
    >
      <SInfoIcon />
    </InfoTooltip>
  )
}
