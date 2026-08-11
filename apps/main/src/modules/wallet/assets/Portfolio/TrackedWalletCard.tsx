import {
  CollapsibleContent,
  CollapsibleRoot,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"

import { useMultichainPortfolio } from "@/api/portfolio"
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
  const { t } = useTranslation("wallet")
  const { byChain, refetchAll, isRefetching, lastUpdatedAt, entries } =
    useMultichainPortfolio([wallet.address], TRACKED_CHAINS)
  const [open, setOpen] = useState(true)
  const isLoading = entries.some((entry) => entry.isLoading)
  const showNoBalances = !isLoading && byChain.length === 0

  return (
    <SPortfolioPaper>
      <CollapsibleRoot open={open} onOpenChange={setOpen}>
        <TrackedWalletHeader
          address={wallet.address}
          open={open}
          isRefreshing={isRefetching}
          lastUpdatedAt={lastUpdatedAt}
          onRefresh={refetchAll}
        />
        <CollapsibleContent
          animationDurationMs={400}
          sx={{ overflow: "hidden" }}
        >
          <SPortfolioChainsList sx={{ minHeight: 0 }}>
            {showNoBalances ? (
              <Text
                fs="p5"
                lh={1.4}
                color={getToken("text.medium")}
                sx={{ py: "xl", px: "primary", textWrap: "balance" }}
              >
                {t("myAssets.tracked.noBalances")}
              </Text>
            ) : (
              byChain.map(
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
              )
            )}
          </SPortfolioChainsList>
        </CollapsibleContent>
      </CollapsibleRoot>
    </SPortfolioPaper>
  )
}
