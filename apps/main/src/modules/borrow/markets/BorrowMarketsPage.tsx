import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Box,
  Flex,
  Input,
  SectionHeader,
  Stack,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { AccountBindingBanner } from "@/modules/borrow/account/AccountBindingBanner"
import { MarketAssetsStats } from "@/modules/borrow/markets/components/MarketAssetsStats"
import { MarketAssetsTable } from "@/modules/borrow/markets/components/MarketAssetsTable"

export const BorrowMarketsPage = () => {
  const { t } = useTranslation(["common", "borrow"])
  const [searchPhrase, setSearchPhrase] = useState("")

  return (
    <Stack gap={30}>
      <MarketAssetsStats />
      <AccountBindingBanner />
      <Box>
        <Flex
          direction={["column", "row"]}
          justify="space-between"
          align={["flex-start", "center"]}
          mb={4}
        >
          <SectionHeader as="h1">
            {t("borrow:market.table.title")}
          </SectionHeader>
          <Input
            sx={{ minWidth: ["100%", 250] }}
            placeholder={t("search.placeholder.assets")}
            iconStart={Search}
            onChange={(e) => setSearchPhrase(e.target.value)}
          />
        </Flex>
        <MarketAssetsTable search={searchPhrase} />
      </Box>
    </Stack>
  )
}
