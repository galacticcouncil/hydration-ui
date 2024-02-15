import { valueToBigNumber } from "@aave/math-utils"
import { Box, Typography } from "@mui/material"
import BigNumber from "bignumber.js"

import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { theme } from "theme"

interface HFContentProps {
  healthFactor: string
}

export const HFContent = ({ healthFactor }: HFContentProps) => {
  const formattedHealthFactor = Number(
    valueToBigNumber(healthFactor).toFixed(2, BigNumber.ROUND_DOWN),
  )

  const dotPosition = +healthFactor > 10 ? 100 : +healthFactor * 10

  return (
    <Box sx={{ position: "relative", mt: "33px", mb: 4 }}>
      <Box
        sx={{
          height: "4px",
          background: `linear-gradient(90deg, ${theme.colors.green400} 0%, ${theme.colors.warning300} 52.08%, ${theme.colors.red500} 100%)`,
          borderRadius: "1px",
          transform: "matrix(-1, 0, 0, 1, 0, 0)",
        }}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: "calc(100% + 6px)",
          left: `${dotPosition > 100 ? 100 : dotPosition}%`,
          zIndex: 3,
        }}
      >
        <Box
          sx={{
            position: "relative",
            whiteSpace: "nowrap",
            "&:after": {
              width: 0,
              height: 0,
              borderStyle: "solid",
              borderWidth: "6px 4px 0 4px",
              borderColor: `white transparent transparent transparent`,
              content: "''",
              position: "absolute",
              left: dotPosition > 75 ? "auto" : "50%",
              right: dotPosition > 75 ? 0 : "auto",
              transform:
                dotPosition > 75 ? "translateX(0)" : "translateX(-50%)",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              position: "absolute",
              left: dotPosition > 75 ? "auto" : dotPosition < 15 ? "0" : "50%",
              transform:
                dotPosition > 75 || dotPosition < 15
                  ? "translateX(0)"
                  : "translateX(-50%)",
              right: dotPosition > 75 ? 0 : "auto",
              flexDirection: "column",
              alignItems:
                dotPosition > 75
                  ? "flex-end"
                  : dotPosition < 15
                  ? "flex-start"
                  : "center",
              textAlign:
                dotPosition > 75
                  ? "right"
                  : dotPosition < 15
                  ? "left"
                  : "center",
              bottom: "calc(100% + 2px)",
            }}
          >
            <FormattedNumber
              value={formattedHealthFactor}
              variant="main12"
              visibleDecimals={2}
            />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: "20%",
          textAlign: "center",
          pt: 1.5,
          "&:after": {
            content: "''",
            position: "absolute",
            bottom: "85%",
            left: "10%",
            transform: "translateX(-50%)",
            height: "10px",
            width: "2px",
            bgcolor: theme.colors.red400,
          },
        }}
      >
        <FormattedNumber
          value={1}
          visibleDecimals={2}
          color={theme.colors.red400}
          variant="subheader2"
        />
        <Typography
          sx={{ display: "flex" }}
          variant="helperText"
          lineHeight="12px"
          color={theme.colors.red400}
        >
          <span>Liquidation value</span>
        </Typography>
      </Box>
    </Box>
  )
}
