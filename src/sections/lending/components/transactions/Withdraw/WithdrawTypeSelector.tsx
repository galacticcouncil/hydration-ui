import { Box, Typography } from "@mui/material"
import { StyledTxModalToggleButton } from "sections/lending/components/StyledToggleButton"
import { StyledTxModalToggleGroup } from "sections/lending/components/StyledToggleButtonGroup"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"

export enum WithdrawType {
  WITHDRAW,
  WITHDRAWSWITCH,
}
export function WithdrawTypeSelector({
  withdrawType,
  setWithdrawType,
}: {
  withdrawType: WithdrawType
  setWithdrawType: (type: WithdrawType) => void
}) {
  const { currentMarketData } = useProtocolDataContext()
  if (!currentMarketData.enabledFeatures?.collateralRepay) return null
  return (
    <Box sx={{ mb: 6 }}>
      <StyledTxModalToggleGroup
        color="primary"
        value={withdrawType}
        exclusive
        onChange={(_, value) => setWithdrawType(value)}
      >
        <StyledTxModalToggleButton
          value={WithdrawType.WITHDRAW}
          disabled={withdrawType === WithdrawType.WITHDRAW}
        >
          <Typography variant="buttonM">
            <span>Withdraw</span>
          </Typography>
        </StyledTxModalToggleButton>

        <StyledTxModalToggleButton
          value={WithdrawType.WITHDRAWSWITCH}
          disabled={withdrawType === WithdrawType.WITHDRAWSWITCH}
        >
          <Typography variant="buttonM">
            <span>Withdraw & Switch</span>
          </Typography>
        </StyledTxModalToggleButton>
      </StyledTxModalToggleGroup>
    </Box>
  )
}
