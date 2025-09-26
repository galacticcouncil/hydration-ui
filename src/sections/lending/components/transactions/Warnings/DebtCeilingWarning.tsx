import { AssetCapData } from "sections/lending/hooks/useAssetCaps"
import { Alert } from "components/Alert"
import { Text } from "components/Typography/Text/Text"

type DebtCeilingWarningProps = {
  debtCeiling: AssetCapData
}

export const DebtCeilingWarning = ({
  debtCeiling,
  ...rest
}: DebtCeilingWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!debtCeiling.percentUsed || debtCeiling.percentUsed < 98) return null

  const renderText = () => {
    return debtCeiling.isMaxed ? (
      <Text fs={13}>
        Protocol debt ceiling is at 100% for this asset. Further borrowing
        against this asset is unavailable.
      </Text>
    ) : (
      <Text fs={13}>
        Maximum amount available to borrow against this asset is limited because
        debt ceiling is at {debtCeiling.percentUsed.toFixed(2)}%.
      </Text>
    )
  }

  return (
    <Alert variant={debtCeiling.isMaxed ? "error" : "warning"} {...rest}>
      {renderText()}
    </Alert>
  )
}
