import {
  Box,
  ChartSkeleton,
  Flex,
  Grid,
  LogoSkeleton,
  Paper,
  Separator,
  Skeleton,
  Stack,
  Text,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  ProseSkeleton,
  TableSkeleton,
} from "@/modules/layout/components/LayoutSkeleton"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"

const StatsSkeleton: FC<{ labels: string[] }> = ({ labels }) => (
  <Stack
    direction="row"
    justify="flex-start"
    gap={["xl", null, "xxxl", "3.75rem"]}
    separated
    sx={{ overflow: "hidden", "& > *": { flexShrink: 0 } }}
  >
    {labels.map((label) => (
      <ValueStats
        key={label}
        size="large"
        fixedSize
        isLoading
        label={label}
        wrap
      />
    ))}
  </Stack>
)

const TitleSearchSkeleton = () => (
  <Flex justify="space-between" align="center" gap="l">
    <Skeleton width={160} height={24} />
    <Skeleton width={120} height={36} />
  </Flex>
)

export const MoneyMarketDashboardSkeleton = () => {
  const { t } = useTranslation("borrow")
  return (
    <Stack gap="xl">
      <StatsSkeleton labels={[t("netWorth"), t("netApy"), t("healthFactor")]} />
      {/* the supply/borrow toggle, shown where the columns stack */}
      <Box display={["block", null, null, "none"]}>
        <Skeleton height={40} />
      </Box>
      <Grid
        columnTemplate={["1fr", null, null, "1fr 1fr"]}
        gap="xl"
        align="start"
        mt="l"
      >
        <Stack gap="xl">
          <TableSkeleton rows={2} cols={[3, null, 4]} />
          <TableSkeleton rows={6} cols={[3, null, 4]} />
        </Stack>
        <Stack gap="xl" display={["none", null, null, "flex"]}>
          <TableSkeleton rows={2} cols={[3, null, 4]} />
          <TableSkeleton rows={6} cols={[3, null, 4]} />
        </Stack>
      </Grid>
    </Stack>
  )
}

export const MarketsPageSkeleton = () => {
  const { t } = useTranslation("borrow")
  return (
    <Stack gap="xl">
      <StatsSkeleton
        labels={[
          t("markets.totalMarketSize"),
          t("markets.totalAvailable"),
          t("markets.totalBorrows"),
        ]}
      />
      <TitleSearchSkeleton />
      <TableSkeleton rows={10} cols={[3, null, 6]} />
    </Stack>
  )
}

export const BorrowHistoryPageSkeleton = () => (
  <Stack gap="xl">
    <TitleSearchSkeleton />
    <TableSkeleton rows={10} cols={[2, null, 4]} />
  </Stack>
)

const SectionSkeleton: FC<{ children: React.ReactNode }> = ({ children }) => (
  <Paper p="xl">
    <Skeleton width={180} height={20} />
    <Separator mx="-xl" my="xl" />
    {children}
  </Paper>
)

// mirrors InterestRates: APY stats, legend + time range, then the chart
const RatesChartSkeleton = () => {
  const { t } = useTranslation("borrow")
  return (
    <Stack gap="xl">
      <Flex gap="xxxl">
        <ValueStats
          size="medium"
          wrap
          isLoading
          label={t("summary.supplyApy")}
        />
        <ValueStats
          size="medium"
          wrap
          isLoading
          label={t("summary.borrowApy")}
        />
      </Flex>
      <Stack gap="base">
        <Flex justify="space-between" align="center" gap="base" wrap>
          <Flex gap="xl">
            <Skeleton width={90} height={16} />
            <Skeleton width={90} height={16} />
          </Flex>
          <Skeleton width={160} height={28} />
        </Flex>
        <ChartSkeleton sx={{ height: [150, 250] }} />
      </Stack>
    </Stack>
  )
}

export const ReserveDetailPageSkeleton = () => (
  <Stack gap="xl">
    <Flex align="center" justify="space-between" gap="xxl" wrap>
      {/* sized as ReserveTitle and ReserveActions, so the header keeps its height */}
      <Flex align="center" gap="base">
        <LogoSkeleton size="large" />
        <Stack>
          <Text font="primary" fs={["h7", null, "h6"]} lh={1} fw={600}>
            <Skeleton width={100} />
          </Text>
          <Text fs="p5">
            <Skeleton width={40} />
          </Text>
        </Stack>
      </Flex>
      {/* the actions are pinned to the screen bottom below md */}
      <Flex gap="base" display={["none", null, "flex"]} sx={{ lineHeight: 0 }}>
        <Skeleton width={100} height="2.5rem" />
        <Skeleton width={40} height="2.5rem" />
      </Flex>
    </Flex>
    <TwoColumnGrid template="sidebar" breakpoint="lg">
      <Stack gap="xl">
        <SectionSkeleton>
          <RatesChartSkeleton />
        </SectionSkeleton>
        <SectionSkeleton>
          <Grid columnTemplate={["1fr 1fr", null, "repeat(3, 1fr)"]} gap="l">
            {Array.from({ length: 6 }, (_, i) => (
              <Stack key={i} gap="xs">
                <Skeleton width="60%" height="1em" />
                <Skeleton width="40%" height="1em" />
              </Stack>
            ))}
          </Grid>
        </SectionSkeleton>
        <TableSkeleton size="small" rows={5} cols={[2, null, 4]} />
      </Stack>
      <SectionSkeleton>
        <ProseSkeleton />
      </SectionSkeleton>
    </TwoColumnGrid>
  </Stack>
)
