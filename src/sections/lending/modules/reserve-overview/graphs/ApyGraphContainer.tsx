import { Box, Button, CircularProgress, Typography } from "@mui/material"
import { ParentSize } from "@visx/responsive"
import { useState } from "react"
import type { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import {
  ReserveRateTimeRange,
  useReserveRatesHistory,
} from "sections/lending/hooks/useReservesHistory"
import { MarketDataType } from "sections/lending/utils/marketsAndNetworksConfig"

import { ESupportedTimeRanges } from "sections/lending/modules/reserve-overview/TimeRangeSelector"
import { ApyGraph } from "./ApyGraph"
import { GraphLegend } from "./GraphLegend"
import { GraphTimeRangeSelector } from "./GraphTimeRangeSelector"

type Field = "liquidityRate" | "stableBorrowRate" | "variableBorrowRate"

type Fields = { name: Field; color: string; text: string }[]

type ApyGraphContainerKey = "supply" | "borrow"

type ApyGraphContainerProps = {
  graphKey: ApyGraphContainerKey
  reserve: ComputedReserveData
  currentMarketData: MarketDataType
}

/**
 * NOTES:
 * This may not be named accurately.
 * This container uses the same graph but with different fields, so we use a 'graphKey' to determine which to show
 * This likely may need to be turned into two different container components if the graphs become wildly different.
 * This graph gets its data via an external API call, thus having loading/error states
 */
export const ApyGraphContainer = ({
  graphKey,
  reserve,
  currentMarketData,
}: ApyGraphContainerProps): JSX.Element => {
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<ReserveRateTimeRange>(ESupportedTimeRanges.OneMonth)

  const CHART_HEIGHT = 155
  let reserveAddress = ""
  if (reserve) {
    if (currentMarketData.v3) {
      reserveAddress = `${reserve.underlyingAsset}${currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}${currentMarketData.chainId}`
    } else {
      reserveAddress = `${reserve.underlyingAsset}${currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER}`
    }
  }
  const { data, loading, error, refetch } = useReserveRatesHistory(
    reserveAddress,
    selectedTimeRange,
  )

  // Supply fields
  const supplyFields: Fields = [
    { name: "liquidityRate", color: "#2EBAC6", text: "Supply APR" },
  ]

  // Borrow fields
  const borrowFields: Fields = [
    ...(reserve.stableBorrowRateEnabled
      ? ([
          {
            name: "stableBorrowRate",
            color: "#E7C6DF",
            text: "Borrow APR, stable",
          },
        ] as const)
      : []),
    {
      name: "variableBorrowRate",
      color: "#B6509E",
      text: "Borrow APR, variable",
    },
  ]

  const fields = graphKey === "supply" ? supplyFields : borrowFields

  const graphLoading = (
    <div
      css={{
        height: CHART_HEIGHT,
        width: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={20} sx={{ mb: 8, opacity: 0.5 }} />
      <Typography variant="subheader1" color="text.muted">
        <span>Loading data...</span>
      </Typography>
    </div>
  )

  const graphError = (
    <Box
      sx={{
        height: CHART_HEIGHT,
        width: "auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Typography variant="subheader1">
        <span>Something went wrong</span>
      </Typography>
      <Typography variant="caption" sx={{ mb: 12 }}>
        <span>Data couldn&apos;t be fetched, please reload graph.</span>
      </Typography>
      <Button variant="outlined" color="primary" onClick={refetch}>
        <span>Reload</span>
      </Button>
    </Box>
  )

  return (
    <Box sx={{ mt: 10, mb: 16 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 4,
        }}
      >
        <GraphLegend labels={fields} />
        <GraphTimeRangeSelector
          disabled={loading || error}
          timeRange={selectedTimeRange}
          onTimeRangeChanged={setSelectedTimeRange}
        />
      </Box>
      <div css={{ height: CHART_HEIGHT }}>
        {loading && graphLoading}
        {error && graphError}
        {!loading && !error && data.length > 0 && (
          <ParentSize>
            {({ width }) => (
              <ApyGraph
                width={width}
                height={CHART_HEIGHT}
                data={data}
                fields={fields}
                selectedTimeRange={selectedTimeRange}
                avgFieldName={
                  graphKey === "supply" ? "liquidityRate" : "variableBorrowRate"
                }
              />
            )}
          </ParentSize>
        )}
      </div>
    </Box>
  )
}
