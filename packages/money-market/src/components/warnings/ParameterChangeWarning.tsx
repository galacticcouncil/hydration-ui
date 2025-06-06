import { Alert } from "@galacticcouncil/ui/components"

export type ParameterChangeWarningProps = {
  className?: string
}

export const ParameterChangeWarning: React.FC<ParameterChangeWarningProps> = ({
  className,
}) => (
  <Alert
    className={className}
    variant="info"
    description="Attention: Parameter changes via governance can alter your account health factor and risk of liquidation."
  />
)
