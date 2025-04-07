import { InfoTooltip } from "components/InfoTooltip/InfoTooltip"
import { Text } from "components/Typography/Text/Text"
import { AssetCapData } from "sections/lending/hooks/useAssetCaps"

type BorrowCapMaxedTooltipProps = {
  borrowCap: AssetCapData
}

export const BorrowCapMaxedTooltip = ({
  borrowCap,
}: BorrowCapMaxedTooltipProps) => {
  if (!borrowCap || !borrowCap.isMaxed) return null

  return (
    <InfoTooltip
      text={
        <Text fs={12}>
          Protocol borrow cap at 100% for this asset. Further borrowing
          unavailable.
        </Text>
      }
    />
  )
}
