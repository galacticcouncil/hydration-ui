import { ExclamationIcon } from "@heroicons/react/outline"
import { Box, SvgIcon } from "@mui/material"

import { ContentWithTooltip } from "sections/lending/components/ContentWithTooltip"
import { OffboardingWarning } from "sections/lending/components/Warnings/OffboardingWarning"

export const OffboardingTooltip = ({
  discussionLink,
}: {
  discussionLink: string
}) => {
  return (
    <ContentWithTooltip
      tooltipContent={
        <Box>
          <OffboardingWarning discussionLink={discussionLink} />
        </Box>
      }
    >
      <SvgIcon sx={{ fontSize: "20px", color: "error.main", ml: 8 }}>
        <ExclamationIcon />
      </SvgIcon>
    </ContentWithTooltip>
  )
}
