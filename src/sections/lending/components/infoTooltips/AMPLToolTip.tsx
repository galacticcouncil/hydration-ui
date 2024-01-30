import { ExclamationIcon } from "@heroicons/react/outline"
import { Box, SvgIcon } from "@mui/material"

import { ContentWithTooltip } from "sections/lending/components/ContentWithTooltip"
import { AMPLWarning } from "sections/lending/components/Warnings/AMPLWarning"

export const AMPLToolTip = () => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <AMPLWarning />
        </Box>
      }
    >
      <SvgIcon sx={{ fontSize: "20px", color: "warning.main", ml: 8 }}>
        <ExclamationIcon />
      </SvgIcon>
    </ContentWithTooltip>
  )
}
