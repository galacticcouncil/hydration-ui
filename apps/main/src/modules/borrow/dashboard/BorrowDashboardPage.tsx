import { Box, Grid, Text } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { DashboardHeader } from "@/modules/borrow/dashboard/components/DashboardHeader"
import { SupplyAssetsTable } from "@/modules/borrow/dashboard/components/SupplyAssetsTable"

export const BorrowDashboardPage = () => {
  const { t } = useTranslation(["borrow"])
  return (
    <Grid py={20} gap={40}>
      <DashboardHeader />
      <Grid columnTemplate={["1fr", null, "1fr 1fr"]} gap={20}>
        <Box>
          <Text as="h2" font="primary" fw={500} fs="h7" mb={12}>
            {t("supplied.table.title")}
          </Text>
          <SupplyAssetsTable />
        </Box>
        <Box>
          <Text as="h2" font="primary" fw={500} fs="h7" mb={12}>
            {t("borrowed.table.title")}
          </Text>
          <SupplyAssetsTable />
        </Box>
        <Box>
          <Text as="h2" font="primary" fw={500} fs="h7" mb={12}>
            {t("supply.table.title")}
          </Text>
          <SupplyAssetsTable />
        </Box>
        <Box>
          <Text as="h2" font="primary" fw={500} fs="h7" mb={12}>
            {t("borrow.table.title")}
          </Text>
          <SupplyAssetsTable />
        </Box>
      </Grid>
    </Grid>
  )
}
