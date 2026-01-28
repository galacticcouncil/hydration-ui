import { ManageEmodeButton } from "@galacticcouncil/money-market/components/primitives"
import { useMoneyMarketData } from "@galacticcouncil/money-market/hooks"
import {
  Box,
  Button,
  Flex,
  Grid,
  SectionHeader,
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
import { HollarBanner } from "@/modules/borrow/hollar/HollarBanner"
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
    <Stack gap="xxl">
      <HollarBanner />
      <DashboardHeader />
      <AccountBindingBanner />
      <Box>
        {shouldRenderFilter && (
          <Grid columns={2} gap="base" mb="base">
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
        <Grid columnTemplate={["1fr", null, null, "1fr 1fr"]} gap="xl">
          {shouldRenderSupply && (
            <Box>
              <SectionHeader
                title={t("supplied.table.title")}
                as="h2"
                noTopPadding
              />
              <SuppliedAssetsTable />
            </Box>
          )}
          {shouldRenderBorrow && (
            <Box>
              <SectionHeader
                title={t("borrowed.table.title")}
                as="h2"
                noTopPadding
                actions={
                  isConnected &&
                  isBound && (
                    <Flex align="center" gap="s">
                      <Text fw={500}>{t("emode.label")}</Text>
                      <ManageEmodeButton />
                    </Flex>
                  )
                }
              />
              <BorrowedAssetsTable />
            </Box>
          )}
          {shouldRenderSupply && (
            <Box>
              <SectionHeader
                title={t("supply.table.title")}
                as="h2"
                noTopPadding
              />

              <SupplyAssetsTable />
            </Box>
          )}
          {shouldRenderBorrow && (
            <Box>
              <SectionHeader
                title={t("borrow.table.title")}
                as="h2"
                noTopPadding
              />
              <BorrowAssetsTable />
            </Box>
          )}
        </Grid>
      </Box>
    </Stack>
  )
}
