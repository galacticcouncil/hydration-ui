import { Alert } from "components/Alert"
import { CheckBox } from "components/CheckBox/CheckBox"
import { Text } from "components/Typography/Text/Text"

interface BorrowAmountWarningProps {
  className?: string
  riskCheckboxAccepted: boolean
  onRiskCheckboxChange: () => void
}

export const BorrowAmountWarning = ({
  className,
  riskCheckboxAccepted,
  onRiskCheckboxChange,
}: BorrowAmountWarningProps) => {
  return (
    <div className={className}>
      <Alert variant="warning" sx={{ my: 20 }}>
        Borrowing this amount will reduce your health factor and increase risk
        of liquidation.
      </Alert>
      <div sx={{ flex: "row", align: "center" }}>
        <CheckBox
          label={
            <Text fs={14} lh={28}>
              I acknowledge the risks involved.
            </Text>
          }
          checked={riskCheckboxAccepted}
          onChange={onRiskCheckboxChange}
        />
      </div>
    </div>
  )
}
