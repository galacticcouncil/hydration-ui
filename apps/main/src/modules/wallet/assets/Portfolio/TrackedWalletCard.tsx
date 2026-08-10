import {
  CollapsibleContent,
  CollapsibleRoot,
  CollapsibleTrigger,
} from "@galacticcouncil/ui/components"
import { FC } from "react"

import { useMultichainPortfolio } from "@/api/multichain"
import { TRACKED_CHAINS } from "@/config/portfolio"
import { SortingProps } from "@/hooks/useDataTableUrlSorting"
import { TrackedWalletHeader } from "@/modules/wallet/assets/Portfolio/TrackedWalletHeader"
import {
  SPortfolioChainsList,
  SPortfolioPaper,
} from "@/modules/wallet/assets/Portfolio/WalletPortfolio.styled"
import { WalletPortfolioChainSection } from "@/modules/wallet/assets/Portfolio/WalletPortfolioChainSection"
import { TrackedWallet } from "@/states/trackedWallets"

type Props = {
  readonly wallet: TrackedWallet
  readonly searchPhrase: string
  readonly sortingProps: SortingProps
}

export const TrackedWalletCard: FC<Props> = ({
  wallet,
  searchPhrase,
  sortingProps,
}) => {
  const { byChain } = useMultichainPortfolio([wallet.address], TRACKED_CHAINS)

  return (
    <SPortfolioPaper>
      <CollapsibleRoot defaultOpen>
        <CollapsibleTrigger asChild>
          <TrackedWalletHeader address={wallet.address} />
        </CollapsibleTrigger>
        <CollapsibleContent
          animationDurationMs={400}
          sx={{ overflow: "hidden" }}
        >
          <SPortfolioChainsList sx={{ minHeight: 0 }}>
            {byChain.map(
              ({
                chainKey,
                chain,
                balances,
                total,
                isLoading,
                isError,
                refetch,
              }) => (
                <WalletPortfolioChainSection
                  key={chainKey}
                  chain={chain}
                  balances={balances}
                  total={total}
                  isLoading={isLoading}
                  isError={isError}
                  refetch={refetch}
                  searchPhrase={searchPhrase}
                  sortingProps={sortingProps}
                  showDepositAction={false}
                />
              ),
            )}
          </SPortfolioChainsList>
        </CollapsibleContent>
      </CollapsibleRoot>
    </SPortfolioPaper>
  )
}
