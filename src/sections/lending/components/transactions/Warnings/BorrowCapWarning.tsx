import { AssetCapData } from "sections/lending/hooks/useAssetCaps"
import { Alert } from "components/Alert"
import { Text } from "components/Typography/Text/Text"

type BorrowCapWarningProps = {
  borrowCap: AssetCapData
}

export const BorrowCapWarning = ({
  borrowCap,
  ...rest
}: BorrowCapWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!borrowCap.percentUsed || borrowCap.percentUsed < 98) return null

  const renderText = () => {
    return borrowCap.isMaxed ? (
      <Text fs={13}>
        Protocol borrow cap is at 100% for this asset. Further borrowing
        unavailable.
      </Text>
    ) : (
      <Text fs={13}>
        Maximum amount available to borrow is limited because protocol borrow
        cap is nearly reached.
      </Text>
    )
  }

  return (
    <Alert {...rest} variant="warning">
      {renderText()}
    </Alert>
  )
}
