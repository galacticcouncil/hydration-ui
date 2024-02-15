import { Typography } from "@mui/material"
import { Warning } from "sections/lending/components/primitives/Warning"

import { ParaswapRatesError } from "./ParaswapRatesError"

interface SwitchErrorsProps {
  ratesError: unknown
  balance: string
  inputAmount: string
}

export const SwitchErrors = ({
  ratesError,
  balance,
  inputAmount,
}: SwitchErrorsProps) => {
  if (ratesError) {
    return <ParaswapRatesError error={ratesError} />
  } else if (Number(inputAmount) > Number(balance)) {
    return (
      <Warning variant="error" sx={{ mt: 4 }}>
        <Typography variant="caption">
          <span>Your balance is lower than the selected amount.</span>
        </Typography>
      </Warning>
    )
  }
  return null
}
