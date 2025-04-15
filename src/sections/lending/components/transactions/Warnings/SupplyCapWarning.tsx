import { AssetCapData } from "sections/lending/hooks/useAssetCaps"
import { Alert } from "components/Alert"
import { Text } from "components/Typography/Text/Text"

type SupplyCapWarningProps = {
  supplyCap: AssetCapData
  icon?: boolean
}

export const SupplyCapWarning = ({
  supplyCap,
  icon = true,
  ...rest
}: SupplyCapWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!supplyCap.percentUsed || supplyCap.percentUsed < 98) return null

  const severity = "warning"

  const renderText = () => {
    return supplyCap.isMaxed ? (
      <Text fs={13}>
        Protocol supply cap is at 100% for this asset. Further supply
        unavailable.
      </Text>
    ) : (
      <Text fs={13}>
        Maximum amount available to supply is limited because protocol supply
        cap is at {supplyCap.percentUsed.toFixed(2)}%.
      </Text>
    )
  }

  return (
    <Alert variant={severity} sx={{ mt: 16 }} {...rest}>
      {renderText()}
    </Alert>
  )
}
