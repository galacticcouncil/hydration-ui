import { Flex } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { MyBonds } from "@/modules/portfolio/overview/MyBonds/MyBonds"
import { MyLiquidity } from "@/modules/portfolio/overview/MyLiquidity/MyLiquidity"
import { PortfolioOverview } from "@/modules/portfolio/overview/PortfolioOverview"
import { PortfolioEmptyState } from "@/modules/portfolio/PortfolioEmptyState"
import { TrackedWallets } from "@/modules/portfolio/tracked/TrackedWallets"

export const PortfolioOverviewPage = () => {
  const { account } = useAccount()

  const liquidityPagination = useDataTableUrlPagination(
    "/portfolio/",
    "liquidityPage",
    10,
  )

  const bondsPagination = useDataTableUrlPagination(
    "/portfolio/",
    "bondsPage",
    10,
  )

  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/portfolio/",
    "search",
    {
      onChange: () => {
        bondsPagination.onPageClick(1)
        liquidityPagination.onPageClick(1)
      },
    },
  )

  const assetsSorting = useDataTableUrlSorting("/portfolio/", "assetsSort")

  const liquiditySorting = useDataTableUrlSorting(
    "/portfolio/",
    "liquiditySort",
    { onChange: () => liquidityPagination.onPageClick(1) },
  )

  const bondsSorting = useDataTableUrlSorting("/portfolio/", "bondsSort", {
    onChange: () => bondsPagination.onPageClick(1),
  })

  const changeSearch = (phrase: string): void => {
    setSearchPhrase(phrase)
    bondsPagination.onPageClick(1)
    liquidityPagination.onPageClick(1)
  }

  if (!account) {
    return <PortfolioEmptyState />
  }

  return (
    <Flex direction="column" gap="xxxl">
      <PortfolioOverview
        key={account.address + "_assets"}
        searchPhrase={searchPhrase}
        onSearchPhraseChange={changeSearch}
        sortingProps={assetsSorting}
        liquidityContent={
          <MyLiquidity
            key={account.address + "_liquidity"}
            searchPhrase={searchPhrase}
            paginationProps={liquidityPagination}
            sortingProps={liquiditySorting}
          />
        }
        bondsContent={
          <MyBonds
            key={account.address + "_bonds"}
            searchPhrase={searchPhrase}
            paginationProps={bondsPagination}
            sortingProps={bondsSorting}
          />
        }
      />
      <TrackedWallets
        key={account.address + "_tracked"}
        searchPhrase={searchPhrase}
        sortingProps={assetsSorting}
      />
    </Flex>
  )
}
