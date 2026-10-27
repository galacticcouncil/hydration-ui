import {
  Box,
  Flex,
  Grid,
  Paper,
  Separator,
  Skeleton,
  Stack,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  ProseSkeleton,
  TableSkeleton,
} from "@/modules/layout/components/LayoutSkeleton"
import { AssetHeaderSkeleton } from "@/modules/layout/components/LayoutSkeleton/AssetHeaderSkeleton"
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

export const MarketsPageSkeleton = () => (
  <Stack gap="xl">
    <StatsSkeleton
      labels={["Total market size", "Total available", "Total borrows"]}
    />
    <TitleSearchSkeleton />
    <TableSkeleton rows={10} cols={[3, null, 6]} />
  </Stack>
)

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

export const ReserveDetailPageSkeleton = () => (
  <Stack gap="xl">
    <Flex align="center" justify="space-between" gap="xxl" wrap>
      <AssetHeaderSkeleton />
      <Flex gap="m">
        <Skeleton width={100} height={36} />
        <Skeleton width={100} height={36} />
      </Flex>
    </Flex>
    <TwoColumnGrid template="sidebar">
      <Stack gap="xl">
        <SectionSkeleton>
          <Skeleton height={240} />
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
