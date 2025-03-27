import { AssetCapData } from "sections/lending/hooks/useAssetCaps"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"

type SupplyCapMaxedTooltipProps = {
  supplyCap: AssetCapData
}

export const SupplyCapMaxedTooltip = ({
  supplyCap,
}: SupplyCapMaxedTooltipProps) => {
  if (!supplyCap || !supplyCap.isMaxed) return null

  return (
    <InfoTooltip
      text={
        <Text fs={12}>
          Protocol supply cap at 100% for this asset. Further supply
          unavailable.
        </Text>
      }
    />
  )
}
