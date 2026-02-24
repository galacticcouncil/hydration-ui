import { Box, Grid, Skeleton, Stack } from "@galacticcouncil/ui/components"
import { FC } from "react"

import { HollarBannerDesktop } from "@/modules/borrow/hollar/HollarBanner.desktop"
import { HeaderValuesSkeleton } from "@/modules/layout/components/LayoutSkeleton/HeaderValuesSkeleton"
import { TableSkeleton } from "@/modules/layout/components/LayoutSkeleton/TableSkeleton"

export const BorrowDashboardSkeletonPage: FC = () => {
  return (
    <Stack gap="xxl">
      <HollarBannerDesktop isLoadingReserves reserve={null} />
      <HeaderValuesSkeleton
        size="large"
        count={3}
        direction={["column", null, "row"]}
        justify="flex-start"
        gap={["base", null, "xxxl", "3.75rem"]}
        separated
      />
      <Grid columnTemplate={["1fr", null, null, "1fr 1fr"]} gap="xl">
        {Array.from({ length: 4 }, (_, i) => (
          <Box key={i}>
            <Box mb="m">
              <Skeleton height="1.5em" width="40%" />
            </Box>
            <TableSkeleton rows={5} cols={3} />
          </Box>
        ))}
      </Grid>
    </Stack>
  )
}
