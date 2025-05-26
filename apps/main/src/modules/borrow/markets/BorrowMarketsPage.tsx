import { Search } from "@galacticcouncil/ui/assets/icons"
import {
  Flex,
  Grid,
  Input,
  SectionHeader,
} from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { MarketAssetsStats } from "@/modules/borrow/markets/components/MarketAssetsStats"
import { MarketAssetsTable } from "@/modules/borrow/markets/components/MarketAssetsTable"

export const BorrowMarketsPage = () => {
  const { t } = useTranslation(["borrow"])
  const [searchPhrase, setSearchPhrase] = useState("")

  return (
    <Grid pt={20} gap={10}>
      <MarketAssetsStats />
      <Flex
        direction={["column", "row"]}
        justify="space-between"
        align={["flex-start", "center"]}
      >
        <SectionHeader>{t("borrow:market.table.title")}</SectionHeader>
        <Input
          sx={{ minWidth: ["100%", 250] }}
          placeholder={t("borrow:searchAssets")}
          iconStart={Search}
          onChange={(e) => setSearchPhrase(e.target.value)}
        />
      </Flex>
      <MarketAssetsTable search={searchPhrase} />
    </Grid>
  )
}
