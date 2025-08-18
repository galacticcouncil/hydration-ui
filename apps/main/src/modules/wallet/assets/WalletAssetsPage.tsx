import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Grid, Input } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { BorrowContextProvider } from "@/modules/borrow/BorrowContextProvider"
import { WalletBalances } from "@/modules/wallet/assets/Balances/WalletBalances"
import { MyAssets } from "@/modules/wallet/assets/MyAssets/MyAssets"
import { MyLiquidity } from "@/modules/wallet/assets/MyLiquidity/MyLiquidity"
import { WalletRewards } from "@/modules/wallet/assets/Rewards/WalletRewards"
import { WalletAssetsSubpageMenu } from "@/modules/wallet/assets/WalletAssetsSubpageMenu"

export const WalletAssetsPage = () => {
  const { t } = useTranslation("common")
  const { account } = useAccount()
  const { isMobile } = useBreakpoints()
  const [searchPhrase, setSearchPhrase] = useState("")

  const { category } = useSearch({
    from: "/_wallet/wallet/assets",
  })

  useEffect(() => {
    setSearchPhrase("")
  }, [isMobile])

  if (!account) {
    // TODO add real fallback, this is placeholder
    return <Web3ConnectButton size="large" />
  }

  return (
    <BorrowContextProvider>
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
              placeholder={t("search.placeholder.assets")}
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
    </BorrowContextProvider>
  )
}
