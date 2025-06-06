import { Alert } from "@galacticcouncil/ui/components"

import { AssetCapData } from "@/hooks/commonTypes"

type SupplyCapWarningProps = {
  supplyCap: AssetCapData
  className?: string
}

export const SupplyCapWarning = ({
  supplyCap,
  className,
}: SupplyCapWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!supplyCap.percentUsed || supplyCap.percentUsed < 98) return null

  return (
    <Alert
      className={className}
      variant="warning"
      description={
        supplyCap.isMaxed
          ? "Protocol supply cap is at 100% for this asset. Further supply unavailable."
          : `Maximum amount available to supply is limited because protocol supply cap is at ${supplyCap.percentUsed.toFixed(2)}%.`
      }
    />
  )
}
