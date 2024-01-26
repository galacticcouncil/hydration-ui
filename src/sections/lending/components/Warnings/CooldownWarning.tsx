import { Typography } from "@mui/material"

import { Link } from "sections/lending/components/primitives/Link"
import { Warning } from "sections/lending/components/primitives/Warning"

export const CooldownWarning = () => {
  return (
    <Warning severity="warning" sx={{ ".MuiAlert-message": { p: 0 }, mb: 6 }}>
      <Typography variant="subheader1">
        <span>Cooldown period warning</span>
      </Typography>
      <Typography variant="caption">
        <span>
          The cooldown period is the time required prior to unstaking your
          tokens (20 days). You can only withdraw your assets from the Security
          Module after the cooldown period and within the unstake window.
          <Link
            href="https://docs.aave.com/faq/migration-and-staking"
            fontWeight={500}
          >
            <span>Learn more</span>
          </Link>
        </span>
      </Typography>
    </Warning>
  )
}
