import { CircularProgress, Paper, PaperProps, Typography } from "@mui/material"
import { ReactNode } from "react"

import LoveGhost from "sections/lending/assets/loveGhost.svg?react"

import { ConnectWalletButton } from "./WalletConnection/ConnectWalletButton"

interface ConnectWalletPaperProps extends PaperProps {
  loading?: boolean
  description?: ReactNode
}

export const ConnectWalletPaper = ({
  loading,
  description,
  sx,
  ...rest
}: ConnectWalletPaperProps) => {
  return (
    <Paper
      {...rest}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        p: 4,
        flex: 1,
        ...sx,
      }}
    >
      <LoveGhost css={{ marginBottom: "16px" }} />
      <>
        {loading ? (
          <CircularProgress />
        ) : (
          <>
            <Typography variant="h2" sx={{ mb: 2 }}>
              <span>Please, connect your wallet</span>
            </Typography>
            <Typography sx={{ mb: 6 }} color="text.secondary">
              {description || (
                <span>
                  Please connect your wallet to see your supplies, borrowings,
                  and open positions.
                </span>
              )}
            </Typography>
            <ConnectWalletButton />
          </>
        )}
      </>
    </Paper>
  )
}
