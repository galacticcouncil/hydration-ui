import { ExternalLinkIcon } from "@heroicons/react/outline"

import { Box, SvgIcon, Typography } from "@mui/material"
import { ReserveFactorTooltip } from "sections/lending/components/infoTooltips/ReserveFactorTooltip"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import { ReserveOverviewBox } from "sections/lending/components/ReserveOverviewBox"
import { ExplorerLinkBuilderProps } from "sections/lending/ui-config/networksConfig"

interface ReserveFactorOverviewProps {
  collectorContract: string
  explorerLinkBuilder: (props: ExplorerLinkBuilderProps) => string
  reserveFactor: string
  reserveName: string
  reserveAsset: string
}

export const ReserveFactorOverview = ({
  collectorContract,
  explorerLinkBuilder,
  reserveFactor,
}: ReserveFactorOverviewProps) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
      }}
    >
      <ReserveOverviewBox
        title={
          <ReserveFactorTooltip
            text={<span>Reserve factor</span>}
            key="res_factor"
            variant="description"
            collectorLink={
              collectorContract
                ? explorerLinkBuilder({
                    address: collectorContract,
                  })
                : undefined
            }
          />
        }
      >
        <FormattedNumber
          value={reserveFactor}
          percent
          variant="secondary14"
          visibleDecimals={2}
        />
      </ReserveOverviewBox>

      <ReserveOverviewBox
        title={
          <Typography variant="description">
            <span>Collector Contract</span>
          </Typography>
        }
      >
        <Link
          href={explorerLinkBuilder({
            address: collectorContract,
          })}
          sx={{ textDecoration: "none" }}
        >
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="description" color="text.secondary">
              <span>View contract</span>
            </Typography>
            <SvgIcon sx={{ ml: 4, fontSize: 14 }}>
              <ExternalLinkIcon />
            </SvgIcon>
          </Box>
        </Link>
      </ReserveOverviewBox>
    </Box>
  )
}
