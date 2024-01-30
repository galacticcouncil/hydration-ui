import { ExternalLinkIcon } from "@heroicons/react/solid"

import { Box, Button, Divider, SvgIcon, Typography } from "@mui/material"
import { Link } from "sections/lending/components/primitives/Link"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

import { ReserveEModePanel } from "sections/lending/modules/reserve-overview/ReserveEModePanel"
import {
  PanelRow,
  PanelTitle,
} from "sections/lending/modules/reserve-overview/ReservePanels"
import { GhoBorrowInfo } from "./GhoBorrowInfo"
import { GhoDiscountCalculator } from "./GhoDiscountCalculator"

type GhoReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const GhoReserveConfiguration: React.FC<
  GhoReserveConfigurationProps
> = ({ reserve }) => {
  return (
    <>
      <PanelRow>
        <PanelTitle>
          <span>About GHO</span>
        </PanelTitle>
        <Box>
          <Typography gutterBottom>
            <span>
              GHO is a native decentralized, collateral-backed digital asset
              pegged to USD. It is created by users via borrowing against
              multiple collateral. When user repays their GHO borrow position,
              the protocol burns that user&apos;s GHO. All the interest payments
              accrued by minters of GHO would be directly transferred to the
              AaveDAO treasury.
            </span>
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://github.com/aave/gho/blob/main/techpaper/GHO_Technical_Paper.pdf"
              sx={{ p: "2px 4px", mt: 8, mr: 8, minWidth: 0 }}
            >
              <Typography sx={{ mr: 4, fontSize: "10px" }}>
                <span>Techpaper</span>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://gho.xyz"
              sx={{ p: "2px 4px", mt: 8, mr: 8, minWidth: 0 }}
            >
              <Typography sx={{ mr: 4, fontSize: "10px" }}>
                <span>Website</span>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
            <Button
              component={Link}
              variant="outlined"
              size="small"
              href="https://docs.gho.xyz/concepts/faq"
              sx={{ p: "2px 4px", mt: 8, mr: 8, minWidth: 0 }}
            >
              <Typography sx={{ mr: 4, fontSize: "10px" }}>
                <span>FAQ</span>
              </Typography>
              <SvgIcon sx={{ fontSize: 14 }}>
                <ExternalLinkIcon />
              </SvgIcon>
            </Button>
          </Box>
        </Box>
      </PanelRow>
      <Divider sx={{ my: { xs: 6, sm: 10 } }} />
      <PanelRow>
        <PanelTitle>
          <span>Borrow info</span>
        </PanelTitle>
        <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: "100%", width: "100%" }}>
          <GhoBorrowInfo reserve={reserve} />
          <Box sx={{ mt: 8 }}>
            <GhoDiscountCalculator />
          </Box>
        </Box>
      </PanelRow>
      {reserve.eModeCategoryId !== 0 && (
        <>
          <Divider sx={{ my: { xs: 6, sm: 10 } }} />
          <ReserveEModePanel reserve={reserve} />
        </>
      )}
    </>
  )
}
