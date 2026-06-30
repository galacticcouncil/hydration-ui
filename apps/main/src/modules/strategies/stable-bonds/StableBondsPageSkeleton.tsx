import {
  Box,
  Paper,
  Separator,
  Skeleton,
  Stack,
} from "@galacticcouncil/ui/components"

import { AppSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { AssetHeaderSkeleton } from "@/modules/layout/components/LayoutSkeleton/AssetHeaderSkeleton"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"

const StableBondsDetailsSkeleton = () => (
  <Paper p="l">
    <Box py="l">
      <Skeleton sx={{ maxWidth: "3xl" }} />
    </Box>
    <Separator mx="-l" mb="l" />
    <Stack
      direction={["column", null, "row"]}
      separated
      gap={["m", null, "xxxl"]}
      justify="flex-start"
    >
      {Array.from({ length: 3 }, (_, i) => (
        <Stack key={i}>
          <Skeleton sx={{ width: "3xl" }} height="1em" />
          <Skeleton sx={{ width: "2xl" }} height="1em" />
        </Stack>
      ))}
    </Stack>
  </Paper>
)

const StableBondsAboutSkeleton = () => (
  <Paper p="xl">
    <Skeleton sx={{ width: "4xl" }} />
    <Separator mx="-xl" my="xl" />
    <Stack>
      {Array.from({ length: 10 }, (_, i) => (
        <Skeleton
          key={i}
          width={`${Math.floor(Math.random() * 51 + 50)}%`}
          height="1em"
        />
      ))}
    </Stack>
  </Paper>
)

export const StableBondsPageSkeleton = () => (
  <Stack gap="xxl">
    <AssetHeaderSkeleton />
    <TwoColumnGrid template="sidebar">
      <Stack gap="xl" sx={{ order: [2, null, 0] }}>
        <StableBondsDetailsSkeleton />
        <StableBondsAboutSkeleton />
      </Stack>
      <AppSkeleton />
    </TwoColumnGrid>
  </Stack>
)
