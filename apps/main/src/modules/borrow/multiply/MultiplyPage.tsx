import {
  Box,
  Flex,
  SectionHeader,
  Stack,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { FeaturedPairs } from "@/modules/borrow/multiply/components/FeaturedPairs"
import { MultiplyPairsTable } from "@/modules/borrow/multiply/components/MultiplyPairsTable"
import { StrategyPositions } from "@/modules/borrow/multiply/components/StrategyPositions"
import { useMultiplyPairs } from "@/modules/borrow/multiply/hooks/useMultiplyPairs"
import { MultiplyPageSkeleton } from "@/modules/borrow/multiply/MultiplyPageSkeleton"

export const MultiplyPage = () => {
  const { t } = useTranslation("borrow")

  const { isLoading, allPairs, featuredItems } = useMultiplyPairs()

  if (isLoading) return <MultiplyPageSkeleton />

  return (
    <Stack>
      <Flex align="center" justify="space-between" width="100%">
        <Stack
          direction={["column", null, "row"]}
          justify="flex-start"
          gap={["base", null, "xxxl", "3.75rem"]}
          separated
        >
          <ValueStats
            label={t("multiply.page.totalDeposits")}
            value="$142.50M"
            size="large"
            wrap={[false, false, true]}
          />
          <ValueStats
            label={t("multiply.page.activeBorrows")}
            value="$86.20M"
            size="large"
            wrap={[false, false, true]}
          />
        </Stack>
      </Flex>

      <Box>
        <StrategyPositions sx={{ mt: "xxl" }} />
        <SectionHeader title={t("multiply.featuredStrategies")} />
        <FeaturedPairs items={featuredItems} />
      </Box>

      <Box>
        <SectionHeader title={t("multiply.allPairs")} />
        <MultiplyPairsTable pairs={allPairs} />
      </Box>
    </Stack>
  )
}
