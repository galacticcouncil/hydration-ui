import { AssetCapData } from "sections/lending/hooks/useAssetCaps"
import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"

type DebtCeilingMaxedTooltipProps = {
  debtCeiling: AssetCapData
}

export const DebtCeilingMaxedTooltip = ({
  debtCeiling,
}: DebtCeilingMaxedTooltipProps) => {
  if (!debtCeiling || !debtCeiling.isMaxed) return null

  return (
    <InfoTooltip
      text={
        <Text fs={12}>
          Protocol debt ceiling is at 100% for this asset. Futher borrowing
          against this asset is unavailable.
        </Text>
      }
    />
  )
}
