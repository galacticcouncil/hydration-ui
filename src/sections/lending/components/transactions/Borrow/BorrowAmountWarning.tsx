import { Box, Checkbox, Typography } from "@mui/material"
import { Warning } from "sections/lending/components/primitives/Warning"

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
      <Warning variant="error" sx={{ my: 24 }}>
        <span>
          Borrowing this amount will reduce your health factor and increase risk
          of liquidation.
        </span>
      </Warning>
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          justifyContent: "center",
          alignItems: "center",
          mx: "24px",
          mb: "12px",
        }}
      >
        <Checkbox
          checked={riskCheckboxAccepted}
          onChange={(event) => {
            onRiskCheckboxChange()
          }}
          size="small"
          data-cy={"risk-checkbox"}
        />
        <Typography variant="description">
          <span>I acknowledge the risks involved.</span>
        </Typography>
      </Box>
    </>
  )
}
