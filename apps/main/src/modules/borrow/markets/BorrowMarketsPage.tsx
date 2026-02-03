import { Search } from "@galacticcouncil/ui/assets/icons"
import { Box, Input, SectionHeader } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { AccountBindingBanner } from "@/modules/borrow/account/AccountBindingBanner"
import { MarketAssetsStats } from "@/modules/borrow/markets/components/MarketAssetsStats"
import { MarketAssetsTable } from "@/modules/borrow/markets/components/MarketAssetsTable"

export const BorrowMarketsPage = () => {
  const { t } = useTranslation(["common", "borrow"])
  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/borrow/markets/",
    "search",
  )

  return (
    <>
      <MarketAssetsStats />
      <AccountBindingBanner />
      <Box>
        <SectionHeader
          as="h1"
          title={t("borrow:market.table.title")}
          actions={
            <Input
              value={searchPhrase}
              placeholder={t("search.placeholder.assets")}
              iconStart={Search}
              onChange={(e) => setSearchPhrase(e.target.value)}
            />
          }
        />
        <MarketAssetsTable search={searchPhrase} />
      </Box>
    </>
  )
}
