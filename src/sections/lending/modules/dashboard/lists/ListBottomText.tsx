import { Typography } from "@mui/material"

import { Link } from "sections/lending/components/primitives/Link"

export const ListBottomText = () => {
  return (
    <Typography variant="secondary14" color="text.secondary">
      <span>
        Since this is a test network, you can get any of the assets if you have
        ETH on your wallet
      </span>
      <Link href="/faucet" variant="main14" sx={{ ml: 4 }}>
        <span>Faucet</span>
      </Link>
      .
    </Typography>
  )
}
