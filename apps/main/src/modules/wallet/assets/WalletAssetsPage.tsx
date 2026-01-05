import { Search } from "@galacticcouncil/ui/assets/icons"
import { Flex, Grid, Icon, Input } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { HollarBanner } from "@/modules/borrow/hollar/HollarBanner"
import { WalletBalances } from "@/modules/wallet/assets/Balances/WalletBalances"
import { MyAssets } from "@/modules/wallet/assets/MyAssets/MyAssets"
import { MyLiquidity } from "@/modules/wallet/assets/MyLiquidity/MyLiquidity"
import { WalletRewards } from "@/modules/wallet/assets/Rewards/WalletRewards"
import { WalletAssetsSubpageMenu } from "@/modules/wallet/assets/WalletAssetsSubpageMenu"
import { WalletEmptyState } from "@/modules/wallet/WalletEmptyState"

export const WalletAssetsPage = () => {
  const { t } = useTranslation("common")
  const { account } = useAccount()
  const { isMobile } = useBreakpoints()
  const [searchPhrase, setSearchPhrase] = useState("")

  const { category } = useSearch({
    from: "/wallet/assets",
  })

  useEffect(() => {
    setSearchPhrase("")
  }, [isMobile])

  if (!account) {
    return <WalletEmptyState />
  }

  return (
    <>
      <Flex direction="column">
        <HollarBanner />
        <Grid
          sx={{
            overflowX: "auto",
          }}
          columnGap={[10, 20]}
          columnTemplate="1fr minmax(0, 400px)"
          pb={isMobile ? 8 : getTokenPx("containers.paddings.primary")}
        >
          <WalletBalances />
          <WalletRewards />
        </Grid>
        {!isMobile && (
          <Flex
            pt={getTokenPx("containers.paddings.tertiary")}
            align="flex-end"
            justify="space-between"
          >
            <WalletAssetsSubpageMenu />
            <Input
              placeholder={t("search.placeholder.assets")}
              leadingElement={<Icon size={18} component={Search} mr={8} />}
              onChange={(e) => setSearchPhrase(e.target.value)}
            />
          </Flex>
        )}
        <Flex direction="column">
          {(isMobile || category === "all" || category === "assets") && (
            <MyAssets searchPhrase={searchPhrase} />
          )}
          {(isMobile || category === "all" || category === "liquidity") && (
            <MyLiquidity searchPhrase={searchPhrase} />
          )}
        </Flex>
      </Flex>
    </>
  )
}
