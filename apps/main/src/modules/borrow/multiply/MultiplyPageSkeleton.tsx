import {
  Flex,
  Grid,
  LogoSkeleton,
  Paper,
  SectionHeader,
  Skeleton,
  Stack,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { TableSkeleton } from "@/modules/layout/components/LayoutSkeleton"
import { HeaderValuesSkeleton } from "@/modules/layout/components/LayoutSkeleton/HeaderValuesSkeleton"

const FeaturedPairCardSkeleton = () => (
  <Paper p="xl">
    <Stack gap="l">
      <Flex
        justify="space-between"
        align="flex-start"
        sx={{ aspectRatio: ["3 / 1", "2 / 1"] }}
      >
        <LogoSkeleton size="large" />
        <Skeleton width={80} height={24} />
      </Flex>
      <Flex gap="xl">
        <Stack gap="xxs">
          <Skeleton width={60} height={12} />
          <Skeleton width={50} height={20} />
        </Stack>
        <Stack gap="xxs">
          <Skeleton width={100} height={12} />
          <Skeleton width={60} height={20} />
        </Stack>
      </Flex>
      <Stack gap="xxs">
        <Skeleton width={80} height={18} />
        <Skeleton height={48} />
      </Stack>
    </Stack>
  </Paper>
)

export const MultiplyPageSkeleton = () => {
  const { t } = useTranslation("borrow")
  return (
    <Stack>
      <HeaderValuesSkeleton
        size="large"
        count={2}
        direction={["column", null, "row"]}
        justify="flex-start"
        gap={["base", null, "xxxl", "3.75rem"]}
        separated
        wrap
      />
      <SectionHeader title={t("multiply.featuredStrategies")} />
      <Grid columns={[1, 1, 2, 2, 4]} gap="l">
        {Array.from({ length: 4 }).map((_, index) => (
          <FeaturedPairCardSkeleton key={index} />
        ))}
      </Grid>
      <SectionHeader title={t("multiply.allPairs")} />
      <TableSkeleton rows={10} cols={[2, null, 4]} />
    </Stack>
  )
}
