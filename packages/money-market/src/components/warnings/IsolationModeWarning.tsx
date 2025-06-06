import { Alert } from "@galacticcouncil/ui/components"

type IsolationModeWarningProps = {
  asset?: string
  severity?: "warning" | "error" | "info"
  className?: string
}

export const IsolationModeWarning = ({
  asset,
  severity = "info",
  className,
}: IsolationModeWarningProps) => (
  <Alert
    className={className}
    title="You are entering Isolation mode"
    description={`In Isolation mode, you cannot supply other assets as collateral. A global debt ceiling limits the borrowing power of the isolated asset. To exit isolation mode disable ${asset ? asset : ""} as collateral before borrowing another asset.`}
    variant={severity}
  />
)
