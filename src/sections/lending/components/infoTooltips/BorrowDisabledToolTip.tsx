import { ExclamationIcon } from "@heroicons/react/outline"
import { Box, SvgIcon } from "@mui/material"

import { ContentWithTooltip } from "sections/lending/components/ContentWithTooltip"
import { BorrowDisabledWarning } from "sections/lending/components/Warnings/BorrowDisabledWarning"

interface BorrowDisabledToolTipProps {
  symbol: string
  currentMarket: string
}
export const BorrowDisabledToolTip = ({
  symbol,
  currentMarket,
}: BorrowDisabledToolTipProps) => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <BorrowDisabledWarning
            symbol={symbol}
            currentMarket={currentMarket}
          />
        </Box>
      }
    >
      <SvgIcon sx={{ fontSize: "20px", color: "error.main", ml: 8 }}>
        <ExclamationIcon />
      </SvgIcon>
    </ContentWithTooltip>
  )
}
