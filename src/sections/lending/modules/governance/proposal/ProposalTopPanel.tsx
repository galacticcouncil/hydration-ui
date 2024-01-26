import { ArrowLeftIcon } from "@heroicons/react/solid"
import { Box, Button, SvgIcon } from "@mui/material"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"

import { TopInfoPanel } from "sections/lending/components/TopInfoPanel/TopInfoPanel"

export const ProposalTopPanel = () => {
  return (
    <TopInfoPanel>
      <Box sx={{ display: "flex", alignItems: "center", mb: "18px" }}>
        <Button
          component={Link}
          href={ROUTES.governance}
          variant="surface"
          size="medium"
          color="primary"
          startIcon={
            <SvgIcon fontSize="small">
              <ArrowLeftIcon />
            </SvgIcon>
          }
        >
          <span>Go Back</span>
        </Button>
      </Box>
    </TopInfoPanel>
  )
}
