import { Checkbox, Typography } from "@mui/material"
import { Alert } from "components/Alert"

interface BorrowAmountWarningProps {
  riskCheckboxAccepted: boolean
  onRiskCheckboxChange: () => void
}

export const BorrowAmountWarning = ({
  riskCheckboxAccepted,
  onRiskCheckboxChange,
}: BorrowAmountWarningProps) => {
  return (
    <>
      <Alert variant="warning" sx={{ my: 20 }}>
        Borrowing this amount will reduce your health factor and increase risk
        of liquidation.
      </Alert>
      <div sx={{ flex: "row", align: "center" }}>
        <Checkbox
          checked={riskCheckboxAccepted}
          onChange={(event) => {
            onRiskCheckboxChange()
          }}
        />
        <Typography variant="description">
          <span>I acknowledge the risks involved.</span>
        </Typography>
      </div>
    </>
  )
}
