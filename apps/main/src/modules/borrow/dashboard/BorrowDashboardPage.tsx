import { ManageEmodeButton } from "@galacticcouncil/money-market/components/primitives"
import { Box, Flex, Grid, Text } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { BorrowAssetsTable } from "@/modules/borrow/dashboard/components/borrow-assets/BorrowAssetsTable"
import { BorrowedAssetsTable } from "@/modules/borrow/dashboard/components/borrowed-assets/BorrowedAssetsTable"
import { DashboardHeader } from "@/modules/borrow/dashboard/components/DashboardHeader"
import { SuppliedAssetsTable } from "@/modules/borrow/dashboard/components/supplied-assets/SuppliedAssetsTable"
import { SupplyAssetsTable } from "@/modules/borrow/dashboard/components/supply-assets/SupplyAssetsTable"

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
          <SuppliedAssetsTable />
        </Box>
        <Box>
          <Flex justify="space-between" align="center" mb={12}>
            <Text as="h2" font="primary" fw={500} fs="h7">
              {t("borrowed.table.title")}
            </Text>
            <Flex align="center" gap={4}>
              {t("emode.label")}
              <ManageEmodeButton />
            </Flex>
          </Flex>
          <BorrowedAssetsTable />
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
          <BorrowAssetsTable />
        </Box>
      </Grid>
    </Grid>
  )
}
