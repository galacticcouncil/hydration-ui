import {
  Flex,
  SectionHeader,
  Stack,
  ValueStats,
} from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { FeaturedStrategies } from "@/modules/borrow/multiply/components/FeaturedStrategies"
import { MultiplyAssetsTable } from "@/modules/borrow/multiply/components/MultiplyAssetsTable"

export const MultiplyPage = () => {
  const { t } = useTranslation("borrow")
  return (
    <Stack>
      <Flex align="center" justify="space-between" width="100%">
        <Stack
          direction={["column", null, "row"]}
          justify="flex-start"
          gap={[10, null, 40, 60]}
          separated
        >
          <ValueStats
            label="Total deposits"
            value="$142.50M"
            size="large"
            wrap={[false, false, true]}
          />
          <ValueStats
            label="Active borrows"
            value="$86.20M"
            size="large"
            wrap={[false, false, true]}
          />
        </Stack>
      </Flex>
      <SectionHeader title={t("multiply.featuredStrategies")} />
      <FeaturedStrategies />
      <SectionHeader title={t("multiply.allPairs")} />
      <MultiplyAssetsTable />
    </Stack>
  )
}
