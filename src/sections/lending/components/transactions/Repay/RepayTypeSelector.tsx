import { Box, Typography } from "@mui/material"
import { StyledTxModalToggleButton } from "sections/lending/components/StyledToggleButton"
import { StyledTxModalToggleGroup } from "sections/lending/components/StyledToggleButtonGroup"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"

export enum RepayType {
  BALANCE,
  COLLATERAL,
}
export function RepayTypeSelector({
  repayType,
  setRepayType,
}: {
  repayType: RepayType
  setRepayType: (type: RepayType) => void
}) {
  const { currentMarketData } = useProtocolDataContext()
  if (!currentMarketData.enabledFeatures?.collateralRepay) return null
  return (
    <Box sx={{ mb: 24 }}>
      <Typography mb={1} color="text.secondary">
        <span>Repay with</span>
      </Typography>

      <StyledTxModalToggleGroup
        color="primary"
        value={repayType}
        exclusive
        onChange={(_, value) => setRepayType(value)}
      >
        <StyledTxModalToggleButton
          value={RepayType.BALANCE}
          disabled={repayType === RepayType.BALANCE}
        >
          <Typography variant="buttonM">
            <span>Wallet balance</span>
          </Typography>
        </StyledTxModalToggleButton>

        <StyledTxModalToggleButton
          value={RepayType.COLLATERAL}
          disabled={repayType === RepayType.COLLATERAL}
        >
          <Typography variant="buttonM">
            <span>Collateral</span>
          </Typography>
        </StyledTxModalToggleButton>
      </StyledTxModalToggleGroup>
    </Box>
  )
}
