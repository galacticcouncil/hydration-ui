import { ExternalLinkIcon } from "@heroicons/react/outline"

import { Box, Skeleton, SvgIcon, useMediaQuery, useTheme } from "@mui/material"
import { CircleIcon } from "sections/lending/components/CircleIcon"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"

import { TopInfoPanelItem } from "sections/lending/components/TopInfoPanel/TopInfoPanelItem"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"

interface ReserveTopDetailsProps {
  underlyingAsset: string
}

export const ReserveTopDetails = ({
  underlyingAsset,
}: ReserveTopDetailsProps) => {
  const { reserves, loading } = useAppDataContext()
  const { currentNetworkConfig } = useProtocolDataContext()

  const theme = useTheme()
  const downToSM = useMediaQuery(theme.breakpoints.down("sm"))

  const poolReserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset,
  ) as ComputedReserveData

  const valueTypographyVariant = downToSM ? "main16" : "main21"
  const symbolsTypographyVariant = downToSM ? "secondary16" : "secondary21"

  const iconStyling = {
    display: "inline-flex",
    alignItems: "center",
    color: "#A5A8B6",
    "&:hover": { color: "#F1F1F3" },
    cursor: "pointer",
  }

  return (
    <>
      <TopInfoPanelItem
        title={<span>Reserve Size</span>}
        loading={loading}
        hideIcon
      >
        <FormattedNumber
          value={Math.max(Number(poolReserve?.totalLiquidityUSD), 0)}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        title={<span>Available liquidity</span>}
        loading={loading}
        hideIcon
      >
        <FormattedNumber
          value={Math.max(Number(poolReserve?.availableLiquidityUSD), 0)}
          symbol="USD"
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        title={<span>Utilization Rate</span>}
        loading={loading}
        hideIcon
      >
        <FormattedNumber
          value={poolReserve?.borrowUsageRatio}
          percent
          variant={valueTypographyVariant}
          symbolsVariant={symbolsTypographyVariant}
          symbolsColor="#A5A8B6"
        />
      </TopInfoPanelItem>

      <TopInfoPanelItem
        title={<span>Oracle price</span>}
        loading={loading}
        hideIcon
      >
        <Box sx={{ display: "inline-flex", alignItems: "center" }}>
          <FormattedNumber
            value={poolReserve?.priceInUSD}
            symbol="USD"
            variant={valueTypographyVariant}
            symbolsVariant={symbolsTypographyVariant}
            symbolsColor="#A5A8B6"
          />
          {loading ? (
            <Skeleton
              width={16}
              height={16}
              sx={{ ml: 1, background: "#383D51" }}
            />
          ) : (
            <CircleIcon tooltipText="View oracle contract" downToSM={downToSM}>
              <Link
                href={currentNetworkConfig.explorerLinkBuilder({
                  address: poolReserve?.priceOracle,
                })}
                sx={iconStyling}
              >
                <SvgIcon sx={{ fontSize: downToSM ? "12px" : "14px" }}>
                  <ExternalLinkIcon />
                </SvgIcon>
              </Link>
            </CircleIcon>
          )}
        </Box>
      </TopInfoPanelItem>
    </>
  )
}
