import { Typography } from "@mui/material"

import { Warning } from "sections/lending/components/primitives/Warning"

export const SNXWarning = () => {
  return (
    <Warning severity="warning">
      <Typography>
        <span>Before supplying</span> SNX{" "}
        <span>
          {" "}
          please check that the amount you want to supply is not currently being
          used for staking. If it is being used for staking, your transaction
          might fail.
        </span>
      </Typography>
    </Warning>
  )
}
