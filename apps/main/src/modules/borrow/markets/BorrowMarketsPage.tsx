import { Search } from "@galacticcouncil/ui/assets/icons"
import { Box, Grid, Input, Text } from "@galacticcouncil/ui/components"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { MarketAssetsStats } from "@/modules/borrow/markets/components/MarketAssetsStats"
import { MarketAssetsTable } from "@/modules/borrow/markets/components/MarketAssetsTable"

export const BorrowMarketsPage = () => {
  const { t } = useTranslation(["borrow"])
  const [searchPhrase, setSearchPhrase] = useState("")

  return (
    <Grid py={20} gap={40}>
      <MarketAssetsStats />
      <Input
        customSize="large"
        placeholder={t("borrow:searchAssets")}
        iconStart={Search}
        onChange={(e) => setSearchPhrase(e.target.value)}
      />
      <Box>
        <Text as="h2" font="primary" fw={500} fs="h7" mb={12}>
          {t("market.table.title")}
        </Text>
        <MarketAssetsTable search={searchPhrase} />
      </Box>
    </Grid>
  )
}
