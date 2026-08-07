import { Flex } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { chainsMap } from "@galacticcouncil/xc-cfg"

import { useDataTableUrlPagination } from "@/hooks/useDataTableUrlPagination"
import { useDataTableUrlSearch } from "@/hooks/useDataTableUrlSearch"
import { useDataTableUrlSorting } from "@/hooks/useDataTableUrlSorting"
import { MyBonds } from "@/modules/wallet/assets/MyBonds/MyBonds"
import { MyLiquidity } from "@/modules/wallet/assets/MyLiquidity/MyLiquidity"
import { WalletPortfolio } from "@/modules/wallet/assets/Portfolio/WalletPortfolio"
import { WalletEmptyState } from "@/modules/wallet/WalletEmptyState"

const bifrost = chainsMap.get("bifrost")!
// @ts-expect-error dasd
bifrost.ws = ["wss://eu.bifrost-polkadot-rpc.liebi.com"]

export const WalletAssetsPage = () => {
  const { account } = useAccount()

  const liquidityPagination = useDataTableUrlPagination(
    "/wallet/assets",
    "liquidityPage",
    10,
  )

  const bondsPagination = useDataTableUrlPagination(
    "/wallet/assets",
    "bondsPage",
    10,
  )

  const [searchPhrase, setSearchPhrase] = useDataTableUrlSearch(
    "/wallet/assets",
    "search",
    {
      onChange: () => {
        bondsPagination.onPageClick(1)
        liquidityPagination.onPageClick(1)
      },
    },
  )

  const assetsSorting = useDataTableUrlSorting("/wallet/assets", "assetsSort")

  const liquiditySorting = useDataTableUrlSorting(
    "/wallet/assets",
    "liquiditySort",
    { onChange: () => liquidityPagination.onPageClick(1) },
  )

  const bondsSorting = useDataTableUrlSorting("/wallet/assets", "bondsSort", {
    onChange: () => bondsPagination.onPageClick(1),
  })

  const changeSearch = (phrase: string): void => {
    setSearchPhrase(phrase)
    bondsPagination.onPageClick(1)
    liquidityPagination.onPageClick(1)
  }

  if (!account) {
    return <WalletEmptyState />
  }

  return (
    <Flex direction="column">
      <WalletPortfolio
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
    </Flex>
  )
}
