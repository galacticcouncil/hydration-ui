import { Alert } from "@galacticcouncil/ui/components"

interface IsolationModeWarningProps {
  asset?: string
  severity?: "warning" | "error"
  className?: string
}

export const IsolationModeWarning = ({
  asset,
  severity,
  className,
}: IsolationModeWarningProps) => {
  return (
    <Alert
      className={className}
      title="You are entering Isolation mode"
      description={`In Isolation mode, you cannot supply other assets as collateral. A
        global debt ceiling limits the borrowing power of the isolated asset. To
        exit isolation mode disable ${asset ? asset : ""} as collateral before
        borrowing another asset.`}
      variant={severity || "info"}
    />
  )
}
