import {
  ChartValues,
  Flex,
  Paper,
  Separator,
  Skeleton,
  Stack,
} from "@galacticcouncil/ui/components"

import { ChartState } from "@/components/ChartState"
import { TableSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid/TwoColumnGrid"

export const WalletAssetsSkeleton = () => {
  return (
    <Stack gap="xl">
      <TwoColumnGrid template="sidebar">
        <Stack as={Paper} p={["secondary", "primary"]}>
          <ChartValues isLoading />
          <ChartState isLoading isEmpty sx={{ height: 300 }} />
        </Stack>
        <Flex
          direction="column"
          gap="base"
          p="xl"
          justify="space-between"
          height="100%"
          as={Paper}
        >
          <Stack gap="base">
            <Skeleton width="50%" />
            <Skeleton width="20%" />
          </Stack>
          <Separator />
          <Stack gap="base">
            <Skeleton width="50%" />
            <Skeleton width="20%" />
          </Stack>
          <Separator />
          <Stack gap="base">
            <Skeleton width="50%" />
            <Skeleton width="20%" />
          </Stack>
        </Flex>
      </TwoColumnGrid>
      <TableSkeleton rows={10} cols={[2, null, 4, 6]} />
    </Stack>
  )
}
