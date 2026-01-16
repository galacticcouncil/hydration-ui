import { Flex, Grid } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { lazy, useState } from "react"

import { HollarBanner } from "@/modules/borrow/hollar/HollarBanner"
import { WalletBalances } from "@/modules/wallet/assets/Balances/WalletBalances"
import { MyAssets } from "@/modules/wallet/assets/MyAssets/MyAssets"
import { MyLiquidity } from "@/modules/wallet/assets/MyLiquidity/MyLiquidity"
import { WalletRewards } from "@/modules/wallet/assets/Rewards/WalletRewards"
import {} from "@/modules/wallet/assets/WalletAssetsFilters.desktop"
import { WalletEmptyState } from "@/modules/wallet/WalletEmptyState"

const WalletAssetFiltersDesktop = lazy(async () => ({
  default: await import(
    "@/modules/wallet/assets/WalletAssetsFilters.desktop"
  ).then((m) => m.WalletAssetFiltersDesktop),
}))

const WalletAssetFiltersMobile = lazy(async () => ({
  default: await import(
    "@/modules/wallet/assets/WalletAssetsFilters.mobile"
  ).then((m) => m.WalletAssetFiltersMobile),
}))

export const WalletAssetsPage = () => {
  const { account } = useAccount()
  const { isMobile } = useBreakpoints()
  const [searchPhrase, setSearchPhrase] = useState("")

  const { category } = useSearch({
    from: "/wallet/assets",
  })

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
        {isMobile ? (
          <WalletAssetFiltersMobile
            category={category}
            searchPhrase={searchPhrase}
            onSearchPhraseChange={setSearchPhrase}
          />
        ) : (
          <WalletAssetFiltersDesktop
            searchPhrase={searchPhrase}
            onSearchPhraseChange={setSearchPhrase}
          />
        )}

        <Flex direction="column">
          {(category === "all" || category === "assets") && (
            <MyAssets
              key={account.address + "_assets"}
              searchPhrase={searchPhrase}
            />
          )}
          {(category === "all" || category === "liquidity") && (
            <MyLiquidity
              key={account.address + "_liquidity"}
              searchPhrase={searchPhrase}
            />
          )}
        </Flex>
      </Flex>
    </>
  )
}
