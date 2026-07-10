import {
  Box,
  ChartValues,
  Skeleton,
  Text,
} from "@galacticcouncil/ui/components"

export const TradeChartValuesSkeleton = () => (
  <ChartValues
    value={
      <Text fs={["p3", "p1"]} fw={600}>
        <Skeleton width={120} />
      </Text>
    }
    displayValue={
      <Box>
        <Text fs="p5">
          <Skeleton width={80} />
        </Text>
        <Text fs="p5">&nbsp;</Text>
      </Box>
    }
  />
)
