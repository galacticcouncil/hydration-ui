import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Grid, Input } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { WalletBalances } from "@/modules/wallet/Balances/WalletBalances"
import { MyAssets } from "@/modules/wallet/MyAssets/MyAssets"
import { MyLiquidity } from "@/modules/wallet/MyLiquidity/MyLiquidity"
import { WalletRewards } from "@/modules/wallet/Rewards/WalletRewards"
import { WalletAssetsSubpageMenu } from "@/modules/wallet/WalletAssetsSubpageMenu"

export const WalletAssetsPage = () => {
  const { t } = useTranslation("wallet")
  const { isMobile } = useBreakpoints()
  const [searchPhrase, setSearchPhrase] = useState("")

  const { category } = useSearch({
    from: "/_wallet/wallet/assets",
  })

  useEffect(() => {
    setSearchPhrase("")
  }, [isMobile])

  return (
    <Flex direction="column" gap={[0, 20]}>
      <Grid
        columnGap={[10, 20]}
        sx={{ gridTemplateColumns: "2fr 1fr", overflowX: "auto" }}
      >
        <WalletBalances />
        <WalletRewards />
      </Grid>
      {!isMobile && (
        <Flex pt={12} align="flex-end" justify="space-between">
          <WalletAssetsSubpageMenu />

          <Input
            placeholder={t("searchAssets")}
            iconStart={Search}
            onChange={(e) => setSearchPhrase(e.target.value)}
          />
        </Flex>
      )}
      {(isMobile || category === "all" || category === "assets") && (
        <MyAssets searchPhrase={searchPhrase} />
      )}
      {(isMobile || category === "all" || category === "liquidity") && (
        <MyLiquidity searchPhrase={searchPhrase} />
      )}
    </Flex>
  )
}
