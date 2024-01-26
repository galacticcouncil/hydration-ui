import { Trans } from "@lingui/macro"
import { Link, Typography } from "@mui/material"

import { ROUTES } from "sections/lending/components/primitives/Link"
import { Warning } from "sections/lending/components/primitives/Warning"

export const AAVEWarning = () => {
  return (
    <Warning severity="info">
      <Typography>
        <span>Supplying your </span> AAVE{" "}
        <span>
          tokens is not the same as staking them. If you wish to stake your{" "}
        </span>{" "}
        AAVE <span>tokens, please go to the </span>{" "}
        <Link href={ROUTES.staking}>
          <span>staking view</span>
        </Link>
      </Typography>
    </Warning>
  )
}
