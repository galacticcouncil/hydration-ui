import { Box, Typography } from "@mui/material"
import { LiquidationPenaltyTooltip } from "sections/lending/components/infoTooltips/LiquidationPenaltyTooltip"
import { LiquidationThresholdTooltip } from "sections/lending/components/infoTooltips/LiquidationThresholdTooltip"
import { MaxLTVTooltip } from "sections/lending/components/infoTooltips/MaxLTVTooltip"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { ReserveOverviewBox } from "sections/lending/components/ReserveOverviewBox"
import { getEmodeMessage } from "sections/lending/components/transactions/Emode/EmodeNaming"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"

import { PanelRow, PanelTitle } from "./ReservePanels"

type ReserverEModePanelProps = {
  reserve: ComputedReserveData
}

export const ReserveEModePanel: React.FC<ReserverEModePanelProps> = ({
  reserve,
}) => {
  return (
    <PanelRow>
      <PanelTitle>E-Mode info</PanelTitle>
      <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: "100%", width: "100%" }}>
        <Box sx={{ display: "inline-flex", alignItems: "center" }}>
          <Typography variant="secondary14" color="text.secondary">
            <span>E-Mode Category</span>
          </Typography>

          <Typography variant="subheader1">
            {getEmodeMessage(reserve.eModeLabel)}
          </Typography>
        </Box>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            pt: "12px",
          }}
        >
          <ReserveOverviewBox
            title={<MaxLTVTooltip text={<span>Max LTV</span>} />}
          >
            <FormattedNumber
              value={reserve.formattedEModeLtv}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>
          <ReserveOverviewBox
            title={
              <LiquidationThresholdTooltip
                text={<span>Liquidation threshold</span>}
              />
            }
          >
            <FormattedNumber
              value={reserve.formattedEModeLiquidationThreshold}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>
          <ReserveOverviewBox
            title={
              <LiquidationPenaltyTooltip
                text={<span>Liquidation penalty</span>}
              />
            }
          >
            <FormattedNumber
              value={reserve.formattedEModeLiquidationBonus}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>
        </Box>
        <Typography variant="caption" color="text.secondary" paddingTop="24px">
          <span>
            E-Mode increases your LTV for a selected category of assets, meaning
            that when E-mode is enabled, you will have higher borrowing power
            over assets of the same E-mode category which are defined by Aave
            Governance. You can enter E-Mode from your{" "}
            <Link
              href={ROUTES.dashboard}
              sx={{ textDecoration: "underline" }}
              variant="caption"
              color="text.secondary"
            >
              Dashboard
            </Link>
            . To learn more about E-Mode and applied restrictions in{" "}
            <Link
              href="https://docs.aave.com/faq/aave-v3-features#high-efficiency-mode-e-mode"
              sx={{ textDecoration: "underline" }}
              variant="caption"
              color="text.secondary"
            >
              FAQ
            </Link>{" "}
            or{" "}
            <Link
              href="https://github.com/aave/aave-v3-core/blob/master/techpaper/Aave_V3_Technical_Paper.pdf"
              sx={{ textDecoration: "underline" }}
              variant="caption"
              color="text.secondary"
            >
              Aave V3 Technical Paper
            </Link>
            .
          </span>
        </Typography>
      </Box>
    </PanelRow>
  )
}
