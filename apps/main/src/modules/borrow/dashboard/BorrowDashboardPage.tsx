import { ManageEmodeButton } from "@galacticcouncil/money-market/components/primitives"
import { useMoneyMarketData } from "@galacticcouncil/money-market/hooks"
import {
  Box,
  Button,
  Flex,
  Grid,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { evmAccountBindingQuery } from "@/api/evm"
import { AccountBindingBanner } from "@/modules/borrow/account/AccountBindingBanner"
import { BorrowAssetsTable } from "@/modules/borrow/dashboard/components/borrow-assets/BorrowAssetsTable"
import { BorrowedAssetsTable } from "@/modules/borrow/dashboard/components/borrowed-assets/BorrowedAssetsTable"
import { DashboardHeader } from "@/modules/borrow/dashboard/components/DashboardHeader"
import { SuppliedAssetsTable } from "@/modules/borrow/dashboard/components/supplied-assets/SuppliedAssetsTable"
import { SupplyAssetsTable } from "@/modules/borrow/dashboard/components/supply-assets/SupplyAssetsTable"
import { useRpcProvider } from "@/providers/rpcProvider"

export const BorrowDashboardPage = () => {
  const { t } = useTranslation(["borrow"])
  const rpc = useRpcProvider()

  const { account } = useAccount()
  const { isConnected } = useMoneyMarketData()

  const { data: isBound } = useQuery(
    evmAccountBindingQuery(rpc, account?.address ?? ""),
  )

  const { gte } = useBreakpoints()
  const [mode, setMode] = useState<"supply" | "borrow">("supply")

  const shouldRenderFilter = !gte("lg")
  const shouldRenderSupply = mode === "supply" || !shouldRenderFilter
  const shouldRenderBorrow = mode === "borrow" || !shouldRenderFilter

  return (
    <Stack gap={30} py={20}>
      <DashboardHeader />
      <AccountBindingBanner />
      <Box>
        {shouldRenderFilter && (
          <Grid columns={2} gap={10} mb={10}>
            <Button
              variant={mode === "supply" ? "secondary" : "tertiary"}
              onClick={() => setMode("supply")}
            >
              {t("borrow:supply")}
            </Button>
            <Button
              variant={mode === "borrow" ? "secondary" : "tertiary"}
              onClick={() => setMode("borrow")}
            >
              {t("borrow:borrow")}
            </Button>
          </Grid>
        )}
        <Grid columnTemplate={["1fr", null, null, "1fr 1fr"]} gap={20}>
          {shouldRenderSupply && (
            <Box>
              <Text as="h2" font="primary" fw={500} fs="h7" mb={6}>
                {t("supplied.table.title")}
              </Text>
              <SuppliedAssetsTable />
            </Box>
          )}
          {shouldRenderBorrow && (
            <Box>
              <Flex justify="space-between" align="center" mb={6}>
                <Text as="h2" font="primary" fw={500} fs="h7">
                  {t("borrowed.table.title")}
                </Text>
                {isConnected && isBound && (
                  <Flex align="center" gap={4}>
                    <Text fw={500}>{t("emode.label")}</Text>
                    <ManageEmodeButton />
                  </Flex>
                )}
              </Flex>
              <BorrowedAssetsTable />
            </Box>
          )}
          {shouldRenderSupply && (
            <Box>
              <Text as="h2" font="primary" fw={500} fs="h7" mb={6}>
                {t("supply.table.title")}
              </Text>
              <SupplyAssetsTable />
            </Box>
          )}
          {shouldRenderBorrow && (
            <Box>
              <Text as="h2" font="primary" fw={500} fs="h7" mb={6}>
                {t("borrow.table.title")}
              </Text>
              <BorrowAssetsTable />
            </Box>
          )}
        </Grid>
      </Box>
    </Stack>
  )
}
