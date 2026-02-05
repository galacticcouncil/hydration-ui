import { Flex, Grid } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { lazy } from "react"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { HollarBanner } from "@/modules/borrow/hollar/HollarBanner"
import { WalletBalances } from "@/modules/wallet/assets/Balances/WalletBalances"
import { MyAssets } from "@/modules/wallet/assets/MyAssets/MyAssets"
import { MyLiquidity } from "@/modules/wallet/assets/MyLiquidity/MyLiquidity"
import { WalletRewards } from "@/modules/wallet/assets/Rewards/WalletRewards"
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

  const assetsPagination = useDataTableUrlPagination(
    "/wallet/assets",
    "assetsPage",
    10,
  )

  const liquidityPagination = useDataTableUrlPagination(
    "/wallet/assets",
    "liquidityPage",
    10,
  )

  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/wallet/assets",
    "search",
    {
      onChange: () => {
        assetsPagination.onPageClick(1)
        liquidityPagination.onPageClick(1)
      },
    },
  )

  const assetsSorting = useDataTableUrlSorting("/wallet/assets", "assetsSort", {
    onChange: () => assetsPagination.onPageClick(1),
  })

  const liquiditySorting = useDataTableUrlSorting(
    "/wallet/assets",
    "liquiditySort",
    { onChange: () => liquidityPagination.onPageClick(1) },
  )

  const changeSearch = (phrase: string): void => {
    setSearchPhrase(phrase)
    assetsPagination.onPageClick(1)
    liquidityPagination.onPageClick(1)
  }

  const { category } = useSearch({
    from: "/wallet/assets",
  })

  if (!account) {
    return <WalletEmptyState />
  }

  return (
    <Flex direction="column">
      <HollarBanner />
      <Grid
        sx={{
          overflowX: "auto",
        }}
        columnGap={["base", "xl"]}
        columnTemplate="1fr minmax(0, 25rem)"
        pb={isMobile ? "base" : "xxl"}
      >
        <WalletBalances />
        <WalletRewards />
      </Grid>
      {isMobile ? (
        <WalletAssetFiltersMobile
          category={category}
          searchPhrase={searchPhrase}
          onSearchPhraseChange={changeSearch}
        />
      ) : (
        <WalletAssetFiltersDesktop
          searchPhrase={searchPhrase}
          onSearchPhraseChange={changeSearch}
        />
      )}

      <Flex direction="column">
        {(category === "all" || category === "assets") && (
          <MyAssets
            key={account.address + "_assets"}
            searchPhrase={searchPhrase}
            paginationProps={assetsPagination}
            sortingProps={assetsSorting}
          />
        )}
        {(category === "all" || category === "liquidity") && (
          <MyLiquidity
            key={account.address + "_liquidity"}
            searchPhrase={searchPhrase}
            paginationProps={liquidityPagination}
            sortingProps={liquiditySorting}
          />
        )}
      </Flex>
    </Flex>
  )
}
