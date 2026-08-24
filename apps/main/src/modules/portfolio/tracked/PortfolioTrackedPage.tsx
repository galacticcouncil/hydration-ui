import { Flex } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"

import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { PortfolioEmptyState } from "@/modules/portfolio/PortfolioEmptyState"
import { TrackedWallets } from "@/modules/portfolio/tracked/TrackedWallets"

export const PortfolioTrackedPage = () => {
  const { account } = useAccount()

  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/portfolio/tracked",
    "search",
  )

  const sortingProps = useDataTableUrlSorting(
    "/portfolio/tracked",
    "assetsSort",
  )

  if (!account) {
    return <PortfolioEmptyState />
  }

  return (
    <Flex direction="column">
      <TrackedWallets
        searchPhrase={searchPhrase}
        onSearchPhraseChange={setSearchPhrase}
        sortingProps={sortingProps}
      />
    </Flex>
  )
}
