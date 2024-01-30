import { Box, Paper, Typography, useMediaQuery, useTheme } from "@mui/material"
import React from "react"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useRootStore } from "sections/lending/store/root"

import { GhoReserveConfiguration } from "./Gho/GhoReserveConfiguration"
import { ReserveConfiguration } from "./ReserveConfiguration"

type ReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const ReserveConfigurationWrapper: React.FC<
  ReserveConfigurationProps
> = ({ reserve }) => {
  const { currentMarket } = useProtocolDataContext()
  const [displayGho] = useRootStore((store) => [store.displayGho])
  const { breakpoints } = useTheme()
  const downToXsm = useMediaQuery(breakpoints.down("xsm"))
  const isGho = displayGho({ symbol: reserve.symbol, currentMarket })

  return (
    <Paper sx={{ pt: 4, pb: 20, px: downToXsm ? 4 : 6 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          flexWrap: "wrap",
          mb:
            reserve.isFrozen ||
            reserve.symbol === "AMPL" ||
            reserve.symbol === "stETH"
              ? "0px"
              : "36px",
        }}
      >
        <Typography variant="h3">
          <span>Reserve status &#38; configuration</span>
        </Typography>
      </Box>
      {isGho ? (
        <GhoReserveConfiguration reserve={reserve} />
      ) : (
        <ReserveConfiguration reserve={reserve} />
      )}
    </Paper>
  )
}
