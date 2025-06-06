import { Alert } from "@galacticcouncil/ui/components"

import { AssetCapData } from "@/hooks/commonTypes"

type DebtCeilingWarningProps = {
  debtCeiling: AssetCapData
  className?: string
}

export const DebtCeilingWarning = ({
  debtCeiling,
  className,
}: DebtCeilingWarningProps) => {
  // Don't show a warning when less than 98% utilized
  if (!debtCeiling.percentUsed || debtCeiling.percentUsed < 98) return null

  return (
    <Alert
      className={className}
      variant={debtCeiling.isMaxed ? "error" : "warning"}
      description={
        debtCeiling.isMaxed
          ? "Protocol debt ceiling is at 100% for this asset. Further borrowing against this asset is unavailable."
          : `Maximum amount available to borrow against this asset is limited because debt ceiling is at ${debtCeiling.percentUsed.toFixed(2)}%.`
      }
    />
  )
}
